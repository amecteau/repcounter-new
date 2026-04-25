# Android APK Signing Guide

> **Purpose**: This guide explains how to generate a release keystore for signing Android APKs and configure GitHub Actions to produce signed release builds.

---

## Background

Android requires all APKs to be digitally signed before installation. Debug builds are automatically signed with a debug keystore. Release builds require a production keystore that you generate and keep secure.

**Without a release keystore**: APKs built in CI will not install on devices ("App not installed" error).

**With a release keystore**: APKs are properly signed and installable on any Android device.

---

## Step 1: Generate Release Keystore (Local)

Run this command on your development machine:

```bash
keytool -genkey -v -keystore release.keystore -alias setforge -keyalg RSA -keysize 2048 -validity 10000
```

**You will be prompted for**:

- **Keystore password**: Choose a strong password. You'll need this for CI.
- **Key password**: Can be the same as keystore password for simplicity.
- **Distinguished Name (DN) fields**:
  - Common Name (CN): Your name or "SetForge"
  - Organizational Unit (OU): Can leave blank or use "Development"
  - Organization (O): Can leave blank or use your GitHub username
  - City/Locality (L), State (ST), Country Code (C): Fill as appropriate

**Important**: This creates `release.keystore` in your current directory. **Never commit this file to git.** Add it to `.gitignore` immediately.

```bash
echo "release.keystore" >> .gitignore
```

**Record these values** (you'll need them for GitHub secrets):

- Keystore password
- Key password (if different from keystore password)
- Key alias: `setforge` (from the command above)

---

## Step 2: Add GitHub Secrets

Go to your GitHub repository settings:

1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following four secrets:

### ANDROID_KEYSTORE

- **Value**: Base64-encoded keystore file
- **How to generate**:

**Windows (PowerShell):**

```powershell
$bytes = [System.IO.File]::ReadAllBytes("release.keystore")
[Convert]::ToBase64String($bytes) | Set-Clipboard
```

**macOS/Linux:**

```bash
base64 -i release.keystore | pbcopy   # macOS
base64 -i release.keystore | xclip    # Linux with xclip
```

Paste the base64 string as the secret value.

### ANDROID_KEY_ALIAS

- **Value**: `setforge`

### ANDROID_KEY_PASSWORD

- **Value**: The key password you entered when generating the keystore

### ANDROID_STORE_PASSWORD

- **Value**: The keystore password you entered when generating the keystore

---

## Step 3: Configure Build Signing (build.gradle)

The signing configuration goes in `src-tauri/gen/android/app/build.gradle`.

**Location in file**: Add a `signingConfigs` block inside the `android` block, before `buildTypes`.

```gradle
android {
    // ... namespace, compileSdk, etc.

    signingConfigs {
        release {
            storeFile file(System.getenv("ANDROID_KEYSTORE_PATH") ?: "release.keystore")
            storePassword System.getenv("ANDROID_STORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD")
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ... minifyEnabled, etc.
        }
    }
}
```

**How it works**:

- `storeFile`: Path to keystore (set by CI via env var)
- Passwords and alias: Read from environment variables (set by CI)
- `buildTypes.release.signingConfig`: Links release builds to the signing config

---

## Step 4: Update GitHub Workflow

In `.github/workflows/release.yml`, the `build-android` job needs to:

1. Decode the base64 keystore secret to a file
2. Set environment variables for the signing config
3. Run the build with `--release` (not `--debug`)

**Add these steps before `npx tauri android build`**:

```yaml
- name: Decode and prepare keystore
  run: |
    echo "${{ secrets.ANDROID_KEYSTORE }}" | base64 --decode > release.keystore
    echo "ANDROID_KEYSTORE_PATH=$(pwd)/release.keystore" >> $GITHUB_ENV
    echo "ANDROID_STORE_PASSWORD=${{ secrets.ANDROID_STORE_PASSWORD }}" >> $GITHUB_ENV
    echo "ANDROID_KEY_ALIAS=${{ secrets.ANDROID_KEY_ALIAS }}" >> $GITHUB_ENV
    echo "ANDROID_KEY_PASSWORD=${{ secrets.ANDROID_KEY_PASSWORD }}" >> $GITHUB_ENV

- name: Build Android APK
  run: npm run tauri android build --apk
```

**Remove the `--debug` flag** if it's currently present in the build command.

---

## Step 5: Verify

1. **Commit and push changes**: The `build.gradle` and workflow updates.
2. **Create and push a test tag**:
   ```bash
   git tag v0.1.1
   git push origin v0.1.1
   ```
3. **Monitor the workflow**: Go to **Actions** tab on GitHub. Watch the `build-android` job.
4. **Download the APK**: If successful, the release will have a signed APK attached.
5. **Install on device**: Transfer to your device and install. Should succeed without "App not installed" error.

---

## Troubleshooting

### "App not installed" error persists

- Verify all 4 GitHub secrets are set correctly (no extra whitespace)
- Check workflow logs: keystore should decode without errors
- Ensure build command does NOT have `--debug` flag

### Build fails with "Keystore file does not exist"

- Check that `ANDROID_KEYSTORE_PATH` env var is set correctly in the decode step
- Verify base64 decode step completes without errors

### Build fails with "Incorrect password"

- Double-check `ANDROID_STORE_PASSWORD` and `ANDROID_KEY_PASSWORD` secrets
- Ensure you're using the same passwords you entered during keystore generation

### "Invalid keystore format"

- Re-encode the keystore to base64 carefully (no line breaks or extra characters)
- Verify the keystore file itself isn't corrupted

---

## Security Notes

- **Never commit `release.keystore` to version control**
- **Keep the keystore file backed up** (if lost, you cannot update the app on user devices)
- **Keep passwords secure** (use a password manager)
- GitHub Secrets are encrypted at rest and only exposed to workflows

---

## Keystore Validity

The keystore generated with `-validity 10000` is valid for ~27 years from creation. When it expires, you'll need to generate a new one and re-sign all future releases.

---

## References

- [Android Developer Docs: Sign Your App](https://developer.android.com/studio/publish/app-signing)
- [Tauri Android Guide](https://v2.tauri.app/develop/mobile/)
- [GitHub Actions: Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
