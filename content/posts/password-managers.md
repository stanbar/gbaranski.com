+++
title = "Comparison of password managers and my setup"
date = 2021-05-17
author = "gbaranski"
tags = ["password-manager", "gopass"]
description = """
This post describes my password manager setup, use of [gopass](https://github.com/gopasspw/gopass) on PC, and [Android-Password-Store](https://github.com/android-password-store/Android-Password-Store) on Android.
"""
showFullContent = false
+++

# Introduction
For a long time I was looking for a password manager which would meet all the following requirements:

1. Open-source,
2. CLI/TUI application must not be written in any scripting language. I don't want slow startup time, I might use a password manager in scripts and 0.5s startup time is unacceptable.
3. Android & Linux support,
4. Option for self-hosting,
5. Must be relatively easy to synchronize between multiple computers, must work on Linux and Android.

## What I've tried so far

### Bitwarden

1. ✅ Open-source, under GNU GPLv2 License.
2. ❌ There is CLI app, but it's written in JS which makes it horribly slow to start up, launching `bw --help` took 544ms; just for comparsion [gopass](https://github.com/gopasspw/gopass) help page takes 66ms, retrieving a specific password takes 200ms, huge difference.
3. ✅ Android & Linux is fully supported, but the desktop app is written in Electron, which is slow; moreover, by enabling Wayland's fractional scaling everything gets blurred.
4. ✅ Self-hosting is possible via [vaultwarden](https://github.com/dani-garcia/vaultwarden).
5. ✅ Super simple to synchronize, probably the easiest of all other options mentioned here.

### KeepassXC

1. ✅ Open-source, under GNU GPLv3 License.
2. ✅ There is `keepassxc-cli`.
3. ✅ Android is supported by [KeepassDX](https://www.keepassdx.com/), I personally don't like the UI of the app; Linux is supported.
4. ✅ Self-host by storing database on computer.
5. ❌ Complicated synchronization between Linux and Android.

### gopass

1. ✅ Open-source, under MIT License.
2. ✅ `gopass` by itself is CLI/TUI Application.
3. ✅ Android is supported by [Android-Password-Store](https://github.com/android-password-store/Android-Password-Store), which is very nice, looks the best of all other apps mentioned here; Linux is supported.
4. ✅ Self-host is possible by storing git repo on my computer.
5. ✅ As soon as you get GPG keys working, synchronization is achieved by synchronizing git repository.

### Verdict

As you can see, gopass meets all of my requirements.

The rest of the post covers
- GPG Keys for safe encrypting/decrypting stored keys.
- Git repository to store passwords.
- Synchronizing passwords between Android and Linux.
- Setting up gopass password store.

# Prerequisites

`GPG_TTY` variable must be set to get GPG working, check if exists by `echo $GPG_TTY`, if it's not set `GPG_TTY` to output of `tty` command.

Bash/ZSH: 
```bash
# ~/.bashrc or ~/.zshrc
export GPG_TTY=$(tty)
```

Fish:
```bash
# ~/.config/fish/config.fish
export GPG_TTY=(tty)
```

# Git repository

Git repository is required to store passwords, however gopass also [supports](https://github.com/gopasspw/gopass/blob/master/docs/setup.md#storing-and-syncing-your-password-store-with-google-drive--dropbox--syncthing--etc) other ways to store passwords, but Git Repo seems best option for me, I store them in Github private repository, although it could be even self-hosted. 

Keep in mind that password database is not the top secret, of course it will be better if it will be private, but the password database by itself will be encrypted with password.

Create Github repository using [Github CLI](https://github.com/cli/cli/)
```bash
$ gh repo create pass
? Visibility Private
? This will create the "pass" repository on GitHub. Continue? Yes
✓ Created repository gbaranski/pass on GitHub
? Create a local project directory for "gbaranski/pass"? No
```

# GPG keys

## GPG Primary key

***If you already have GPG Primary Key that you can use, you can skip this step***
   
Generate new GPG Key using `gpg --full-generate-key --expert`, in this example we're using RSA because I'm not sure about ECC keys compatibility.

The primary key won't be able to encrypt/sign, there will have sub-keys for that, primary key will be used only for creating new sub-keys if needed, however for password managament purposes we're going to use only one sub-key for all computers.

```none
$ gpg --full-generate-key --expert
gpg (GnuPG) 2.2.27; Copyright (C) 2021 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Please select what kind of key you want:
   (1) RSA and RSA (default)
   (2) DSA and Elgamal
   (3) DSA (sign only)
   (4) RSA (sign only)
   (7) DSA (set your own capabilities)
   (8) RSA (set your own capabilities)
   (9) ECC and ECC
  (10) ECC (sign only)
  (11) ECC (set your own capabilities)
  (13) Existing key
  (14) Existing key from card
Your selection? 8

Possible actions for a RSA key: Sign Certify Encrypt Authenticate
Current allowed actions: Sign Certify Encrypt

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? E

Possible actions for a RSA key: Sign Certify Encrypt Authenticate
Current allowed actions: Sign Certify

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? S

Possible actions for a RSA key: Sign Certify Encrypt Authenticate
Current allowed actions: Certify

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? Q
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072) 4096
Requested keysize is 4096 bits
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 0
Key does not expire at all
Is this correct? (y/N) Y

GnuPG needs to construct a user ID to identify your key.

Real name: Grzegorz Baranski
Email address: root@gbaranski.com
Comment:
You selected this USER-ID:
    "Grzegorz Baranski <root@gbaranski.com>"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.
gpg: key 2B0DFED5C9433443 marked as ultimately trusted
gpg: directory '/home/gbaranski/.gnupg/openpgp-revocs.d' created
gpg: revocation certificate stored as '/home/gbaranski/.gnupg/openpgp-revocs.d/226CDFD0B2C81A32E2C3DBEF2B0DFED5C9433443.rev'
public and secret key created and signed.

pub   rsa4096 2021-05-17 [C]
      226CDFD0B2C81A32E2C3DBEF2B0DFED5C9433443
uid                      Grzegorz Baranski <root@gbaranski.com>
```

In this example root@gbaranski.com will used as GPG Key ID identifier, of course replace it with your own email when setting it up, but if you have few GPG Key IDs with the same email, check your GPG Key ID by using `gpg --list-secret-keys --keyid-format 0xLONG` and then use it instead email.

Check if the keypair has been properly created
```none
$ gpg --list-secret-key --keyid-format 0xLONG root@gbaranski.com
sec   rsa4096/0x2B0DFED5C9433443 2021-05-17 [C]
      226CDFD0B2C81A32E2C3DBEF2B0DFED5C9433443
uid                   [ultimate] Grzegorz Baranski <root@gbaranski.com>
ssb   rsa4096/0x1EF8CFF39BDF9EB4 2021-05-17 [E]
```

### Backing up primary secret key

Copy `~/.gnupg` to some safe place, such as USB Stick. In my example it will be at `/media/usb/gnupg`, if mounting it there is not possible, you can use soft links to accomplish this.

Remove key from computer since it's safely stored
```bash
$ gpg --delete-key root@gbaranski.com
```

## GPG Sub Key

The only usage of GPG Sub Key will be encoding, so disallow "Sign" which is allowed by default.

Generate new GPG Sub Key
```none
$ gpg --homedir /media/usb/gnupg --expert --edit-key root@gbaranski.com
gpg (GnuPG) 2.2.27; Copyright (C) 2021 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Secret key is available.

sec  rsa4096/2B0DFED5C9433443
     created: 2021-05-17  expires: never       usage: C
     trust: ultimate      validity: ultimate
[ultimate] (1). Grzegorz Baranski <root@gbaranski.com>

gpg> addkey
Please select what kind of key you want:
   (3) DSA (sign only)
   (4) RSA (sign only)
   (5) Elgamal (encrypt only)
   (6) RSA (encrypt only)
   (7) DSA (set your own capabilities)
   (8) RSA (set your own capabilities)
  (10) ECC (sign only)
  (11) ECC (set your own capabilities)
  (12) ECC (encrypt only)
  (13) Existing key
  (14) Existing key from card
Your selection? 8

Possible actions for a RSA key: Sign Encrypt Authenticate
Current allowed actions: Sign Encrypt

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? S

Possible actions for a RSA key: Sign Encrypt Authenticate
Current allowed actions: Encrypt

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? Q
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072) 4096
Requested keysize is 4096 bits
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0)
Key does not expire at all
Is this correct? (y/N) Y
Really create? (y/N) Y
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.

sec  rsa4096/2B0DFED5C9433443
     created: 2021-05-17  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb  rsa4096/1EF8CFF39BDF9EB4
     created: 2021-05-17  expires: never       usage: E
[ultimate] (1). Grzegorz Baranski <root@gbaranski.com>

gpg> save
```

### Veryfing generated sub-key

#### Check whether sub-key exists in keys list

```none
$ gpg --homedir /media/usb/gnupg --expert --list-keys --keyid-format 0xLONG
/media/usb/gnupg/pubring.kbx
----------------------------
pub   rsa4096/0x2B0DFED5C9433443 2021-05-17 [C]
      226CDFD0B2C81A32E2C3DBEF2B0DFED5C9433443
uid                   [ultimate] Grzegorz Baranski <root@gbaranski.com>
sub   rsa4096/0x1EF8CFF39BDF9EB4 2021-05-17 [E]
```

Sub-key has been created with Key ID `0x1EF8CFF39BDF9EB4`, copy this ID, it will be needed in next step.

##### Check if encrypting/decrypting works properly

```none
$ echo "hello there!" | gpg --homedir /media/usb/gnupg --recipient root@gbaranski.com --encrypt | gpg --homedir /media/usb/gnupg --decrypt
gpg: encrypted with 4096-bit RSA key, ID 1EF8CFF39BDF9EB4, created 2021-05-17
      "Grzegorz Baranski <root@gbaranski.com>"
hello there!
```

### Exporting from store

```bash
$ gpg --homedir /media/usb/gnupg --output /tmp/gpg-subkey --export-secret-subkeys root@gbaranski.com! SUB_KEY_ID!
$ gpg --homedir /media/usb/gnupg --export-ownertrust > /tmp/gpg-ownertrust
```

**Replace SUB_KEY_ID with ID copied from previous step, dont forget exclamation mark**

*Example with `0x1EF8CFF39BDF9EB4` as SUB_KEY_ID*
```bash
$ gpg --homedir /media/usb/gnupg --output /tmp/gpg-subkey --export-secret-subkeys root@gbaranski.com! 0x1EF8CFF39BDF9EB4!
```

### Importing on the same PC

```bash
$ gpg --import /tmp/gpg-subkey
$ gpg --import-ownertrust /tmp/gpg-ownertrust
$ rm /tmp/gpg-subkey
```

Verify that `gpg -K` shows `sec#` instead of just `sec` for primary key.
```bash
$ gpg -K
/home/gbaranski/.gnupg/pubring.kbx
----------------------------------
sec#  rsa4096 2021-05-17 [C]
      226CDFD0B2C81A32E2C3DBEF2B0DFED5C9433443
uid           [ultimate] Grzegorz Baranski <root@gbaranski.com>
ssb   rsa4096 2021-05-17 [E]
```

Integrate gopass with previously created Github repository
```none
$ gopass setup

   __     _    _ _      _ _   ___   ___
 /'_ '\ /'_'\ ( '_'\  /'_' )/',__)/',__)
( (_) |( (_) )| (_) )( (_| |\__, \\__, \
'\__  |'\___/'| ,__/''\__,_)(____/(____/
( )_) |       | |
 \___/'       (_)

🌟 Welcome to gopass!
🌟 Initializing a new password store ...
🌟 Configuring your password store ...
🎮 Please select a private key for encrypting secrets:
[0] gpg - 0x2B0DFED5C9433443 - Grzegorz Baranski <root@gbaranski.com>
Please enter the number of a key (0-0, [q]uit) (q to abort) [0]:
Please enter an email address for password store git config []: root@gbaranski.com
❓ Do you want to add a git remote? [y/N/q]: Y
Configuring the git remote ...
Please enter the git remote for your shared store []: git@github.com:gbaranski/pass.git
✅ Configured
```

Add example password to store using `gopass create`
```none
$ gopass create
🌟 Welcome to the secret creation wizard (gopass create)!
🧪 Hint: Use 'gopass edit -c' for more control!
[ 0] Website Login
[ 1] PIN Code (numerical)
[ 2] Generic

Please select the type of secret you would like to create (q to abort) [0]:
0
🧪 Creating Website login
  [1] URL                                    []: login.gbaranski.com
  [2] Login                                  []: gbaranski
  [3] Generate Password?                     [Y/n/q]: n
Enter password for gbaranski:
Retype password for gbaranski:
  [4] Comments                               []:
✅ Credentials saved to "websites/login.gbaranski.com/gbaranski"
```

View newly added password using `gopass show`

```none
$ gopass show websites/login.gbaranski.com/gbaranski
Secret: websites/login.gbaranski.com/gbaranski

my-password
comment:
url: login.gbaranski.com
username: gbaranski
````

### Importing on remote PC

Use some file-transfer program e.g [`croc`](https://github.com/schollz/croc).

Send keys from PC-A to PC-B

On PC-A
```none
$ croc send /tmp/gpg-subkey /tmp/gpg-ownertrust
Sending 2 files (3.7 kB)
Code is: 0560-mile-mercury-deliver
On the other computer run

croc 0560-mile-mercury-deliver

Sending (->[fe80::86bd:8740:e58d:993b%wlan0]:42712)
gpg-subkey     100% |████████████████████| (3.5/3.5 kB, 1.931 MB/s) 1/2
gpg-ownertrust 100% |████████████████████| (167/167 B, 245.872 kB/s) 2/2
```

On PC-B
```none
$ croc --out /tmp 0560-mile-mercury-deliver

Accept 2 files (3.7 kB)? (y/n) y

Receiving (<-[fe80::6db:47aa:c755:f345%enp3s0]:9009)
 gpg-subkey     100% |████████████████████| (3.5/3.5 kB, 512.473 kB/s) 1/2
 gpg-ownertrust 100% |████████████████████| (167/167 B, 25.553 kB/s) 2/2
```

Continue with [Importing on the same PC](#importing-on-the-same-pc)

#### Importing on Android

Send keys to Android using [`croc`](https://github.com/schollz/croc)
```none
$ croc send /tmp/gpg-subkey
Sending 'gpg-subkey' (3.5 kB)
Code is: 3343-system-book-sinatra
On the other computer run

croc 3343-system-book-sinatra

Sending (->192.168.1.214:37712)
 100% |████████████████████| (3.5/3.5 kB, 4.728 MB/s)
```

Receive them on Android using [Croc Android](https://f-droid.org/en/packages/com.github.howeyc.crocgui/)

To import PGP Key on Android, use OpenKeychain app, available in [`F-Droid`](https://f-droid.org/en/packages/org.sufficientlysecure.keychain/).
Import gpg-subkey by selecting  and then "Import from File".

Open [Android-Password-Store](https://github.com/android-password-store/Android-Password-Store), clone repository from Github and view your passwords.

# Conclusions

gopass is awesome password manager for people who like using things in terminal, for me setting up GPG keys correctly was the hardest thing.

I hope this article was useful and saved you some time. 👋
