# iOS IPA Signing Guide

> **Purpose**: This guide explains how to upgrade the CI build from a debug/unsigned `.app` bundle to a properly signed `.ipa` that can be installed on real devices or submitted to the App Store.

---

## Background

iOS requires all builds to be digitally signed before installation on a physical device. Unlike Android, there is no "debug keystore" equivalent — even debug device builds need a valid signing identity.

**Without signing**: The CI produces a zipped `.app` bundle (compile verification only — not installable on devices).

**With signing**: CI produces a signed `.ipa` installable via Ad Hoc distribution or TestFlight.

---

## Prerequisites

- An Apple Developer Program membership ($99/year)
- A Mac to export certificates from Keychain Access
- Access to the [Apple Developer portal](https://developer.apple.com/account)

---

## Step 1: Export Distribution Certificate as P12

1. On your Mac, open **Keychain Access**
2. Under **My Certificates**, find your **Apple Distribution** certificate
3. Right-click it → **Export** → save as `.p12`
4. Choose a strong export password — you'll need this for CI

**Record**: the export password

---

## Step 2: Download Provisioning Profile

1. Go to **Apple Developer portal** → **Certificates, Identifiers & Profiles** → **Profiles**
2. Create or download an **Ad Hoc** provisioning profile for the app identifier `io.github.amecteau.setforge`
3. Download the `.mobileprovision` file

---

## Step 3: Add GitHub Secrets

Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Add four secrets:

### IOS_CERTIFICATE

Base64-encoded `.p12` file:

```bash
base64 -i certificate.p12 | pbcopy   # macOS — copies to clipboard
```

Paste as the secret value.

### IOS_CERTIFICATE_PASSWORD

The export password you chose in Step 1.

### IOS_PROVISIONING_PROFILE

Base64-encoded `.mobileprovision` file:

```bash
base64 -i profile.mobileprovision | pbcopy
```

### APPLE_TEAM_ID

Your 10-character Apple Developer Team ID. Find it at [developer.apple.com/account](https://developer.apple.com/account) under Membership Details.

---

## Step 4: Update the Workflow

In `.github/workflows/release.yml`, replace the `build-ios` job's signing + build steps with:

```yaml
    - name: Set up signing keychain
      run: |
        KEYCHAIN_PATH=$RUNNER_TEMP/signing.keychain-db
        security create-keychain -p "" "$KEYCHAIN_PATH"
        security set-keychain-settings -lut 21600 "$KEYCHAIN_PATH"
        security unlock-keychain -p "" "$KEYCHAIN_PATH"
        echo "${{ secrets.IOS_CERTIFICATE }}" | base64 --decode > $RUNNER_TEMP/cert.p12
        security import "$RUNNER_TEMP/cert.p12" -P "${{ secrets.IOS_CERTIFICATE_PASSWORD }}" \
          -A -t cert -f pkcs12 -k "$KEYCHAIN_PATH"
        security list-keychain -d user -s "$KEYCHAIN_PATH"

    - name: Install provisioning profile
      run: |
        PP_PATH=$RUNNER_TEMP/profile.mobileprovision
        echo "${{ secrets.IOS_PROVISIONING_PROFILE }}" | base64 --decode > "$PP_PATH"
        mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
        cp "$PP_PATH" ~/Library/MobileDevice/Provisioning\ Profiles/

    - name: Build IPA
      env:
        APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
      run: npx tauri ios build

    - name: Rename IPA
      run: |
        IPA=$(find src-tauri/gen/apple/build -name "*.ipa" | head -n 1)
        mv "$IPA" "$(dirname "$IPA")/setforge-${{ github.ref_name }}.ipa"

    - name: Upload IPA
      uses: actions/upload-artifact@v7.0.1
      with:
        name: ios-ipa
        path: src-tauri/gen/apple/build/**/*.ipa
```

Remove the old "Build iOS (debug, unsigned)", "Zip app bundle", and "Upload iOS artifact" steps.

---

## Step 5: Verify

1. Commit and push the workflow changes
2. Create and push a test tag:
   ```bash
   git tag v0.1.1
   git push origin v0.1.1
   ```
3. Go to **Actions** tab on GitHub and watch `build-ios`
4. Download the `.ipa` from the release and install via TestFlight or a tool like AltStore

---

## Troubleshooting

### "No signing certificate found"

- Verify `IOS_CERTIFICATE` decodes correctly — run `echo "$SECRET" | base64 --decode | file -` locally
- Check the certificate is an Apple Distribution cert (not Development)

### "Provisioning profile does not match"

- Ensure the profile covers the bundle ID `io.github.amecteau.setforge`
- Ensure the profile type matches (Ad Hoc for device testing)

### "Team ID mismatch"

- Double-check `APPLE_TEAM_ID` — it's exactly 10 alphanumeric characters
- Find it in the Apple Developer portal under Membership

### Build fails with "Code signing is required"

- This means the unsigned build flags were removed but signing wasn't fully configured
- Ensure all four secrets are set before removing the `CODE_SIGNING_REQUIRED=NO` flags

---

## Security Notes

- **Never commit `.p12` or `.mobileprovision` files to version control**
- **Keep the `.p12` and its password backed up** (losing it means re-creating the certificate)
- GitHub Secrets are encrypted at rest and never appear in logs

---

## Certificate Expiry

Apple Distribution certificates expire after **1 year**. When yours expires:

1. Create a new certificate in Apple Developer portal
2. Export it as `.p12`
3. Update the `IOS_CERTIFICATE` and `IOS_CERTIFICATE_PASSWORD` GitHub Secrets
4. Re-download and re-encode the provisioning profile if it also expired

---

## References

- [Apple Developer: Code Signing](https://developer.apple.com/support/code-signing/)
- [Tauri iOS Guide](https://v2.tauri.app/develop/mobile/)
- [GitHub Actions: Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
