+++
title = "GnuPG & Password manager setup"
date = 2021-05-17
author = "gbaranski"
tags = ["password-manager", "gnupg", "gopass"]
description = """
A post describing my GnuPG and Password manager setup, I will use [gopass](https://github.com/gopasspw/gopass) on PC, and [Android-Password-Store](https://github.com/android-password-store/Android-Password-Store) on Android.
"""
showFullContent = false

+++

# Introduction
I was looking for password manager for quite long time which will meet all following requirements
1. Open-source
2. CLI/TUI application, mustn't be written in any scripting languauge, I don't want high startup time, I might use password manager in scripts and 0.5s startup time bottleneck is not a way to go.
3. Android & Linux support
4. Option for self-hosting
5. Must be relatively easy to synchronize between multiple computers, must work on Linux and Android.

## What I've tried so far

### Bitwarden

1. ✅ Open-source, under GNU GPLv2 License.
2. ❌ There is CLI app, but it's written in JS which makes it horribly slow to stat up, launching `bw --help` took 544ms, it's a lot, just for comparsion [gopass](https://github.com/gopasspw/gopass) help page takes 66ms, retrieving specific password takes 200ms, huge difference.
3. ✅ Android & Linux is fully supported, desktop app is written in Electron, which is slow and enabling Wayland's fractional scaling makes everything blurred.
4. ✅ Yes, via [vaultwarden](https://github.com/dani-garcia/vaultwarden).
5. ✅ Super simple to synchronize, probably easiest from all options I've mentioned here.

### KeepassXC

1. ✅ Open-source, under GNU GPLv3 License.
2. ✅ There is `keepassxc-cli`.
3. ✅ Android is supported by [KeepassDX](https://www.keepassdx.com/), I personally don't like the UI of app, Linux is supported
4. ✅ Self-host by storing database on computer.
5. ❌ Complicated synchronization between Linux and Android.

### gopass

1. ✅ Open-source, under MIT License.
2. ✅ gopass by itself is CLI/TUI Application.
3. ✅ Android is supported by [Android-Password-Store](https://github.com/android-password-store/Android-Password-Store), application is very nice, looks best from all mobile applications mentioned here, Linux is supported.
4. ✅ Self-host by storing Git repo on computer.
5. ✅ As soon as you get GPG keys working, it's super easy by pushing it to Github 

### Verdict

As you can see, gopass meets all of my requirements.

This post is going to cover
- GPG Keys for safe encrypting/decrypting stored keys.
- Git repository to store passwords.
- Synchronizing passwords between Android and Linux.
- Setting up gopass password store.
# Prerequisites

`GPG_TTY` variable must be set to get GPG working, check if exits by `echo $GPG_TTY`, if it's not, add
```bash
export GPG_TTY=$(tty)
```
to `~/.zshrc` or `~/.bashrc`

If you're using fish, add
```zsh
export GPG_TTY=(tty)
```
to `~/.config/fish/config.fish`

# Setting up GPG keys

### GPG Master key

Start by generating master key using
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
```

Use the `gpg --list-secret-keys --keyid-format LONG` command to list GPG keys for which you have both a public and private key.

```none
$ gpg --list-secret-keys --keyid-format 0xLONG
/home/gbaranski/.gnupg/pubring.kbx
----------------------------------
sec   rsa4096/0x613733AF902BDC4C 2021-05-17 [C]
      801AD69CD60DE3BAB8DB93BE21B95312C440B055
uid                   [ultimate] Grzegorz Baranski <root@gbaranski.com>
```

From the list copy GPG Key ID you'd like to use. In this example GPG key ID is `0x613733AF902BDC4C`.

### Backing up primary secret key

We should copy `~/.gnupg` to some safe place, such as USB Drive, plug in your USB drive, check where it is by using `lsblk`, and mount it on `/media/usb`
```
$ sudo mkdir -p /media/usb
$ lsblk
NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sda           8:0    1   7.3G  0 disk
└─sda1        8:1    1   7.3G  0 part
nvme0n1     259:0    0 476.9G  0 disk
├─nvme0n1p1 259:1    0    10G  0 part
├─nvme0n1p2 259:2    0   290G  0 part /home
├─nvme0n1p3 259:3    0     1G  0 part /boot
└─nvme0n1p4 259:4    0    79G  0 part /
$ sudo mount -o umask=0022,uid=${UID} /dev/sda1 /media/usb  # For bash/zsh/...
$ sudo mount -o umask=0022,uid=(id -u) /dev/sda1 /media/usb # For fish
$ cp -r ~/.gnupg /media/usb/gnupg
```

Now we can safely delete GPG key from PC
```bash
$ gpg --delete-key 0x613733AF902BDC4C
```

### Generating GPG sub key

Start by running `gpg --expert --edit-key 0x613733AF902BDC4C`, replacing `0x613733AF902BDC4C` with GPG Primary Key ID.

```bash
$ gpg --homedir /media/usb/gnupg --expert --edit-key 0x613733AF902BDC4C
addcardkey  addkey      addphoto    addrevoker  adduid
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

sec  rsa4096/613733AF902BDC4C
     created: 2021-05-17  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb  rsa4096/3EE324A9B640B56C
     created: 2021-05-17  expires: never       usage: E
ssb  rsa4096/3D106246AB342382
     created: 2021-05-17  expires: never       usage: E
[ultimate] (1). Grzegorz Baranski <root@gbaranski.com>

gpg> save
```

We can check if it exist in key list
```
$ gpg --homedir /media/usb/gnupg --expert --list-keys --keyid-format 0xLONG
/media/usb/gnupg/pubring.kbx
----------------------------
pub   rsa4096/0x613733AF902BDC4C 2021-05-17 [C]
      2561C4FA71384ADB4F3C64A8613733AF902BDC4C
uid                   [ultimate] Grzegorz Baranski <root@gbaranski.com>
sub   rsa4096/0x3EE324A9B640B56C 2021-05-17 [E]
sub   rsa4096/0x3D106246AB342382 2021-05-17 [E]
```
As you can see, there is new sub-key, in my case there are already two sub-keys

We can verify if encrypting/decrypting works with one of those sub-keys
```bash
$ echo "hello there!" | gpg --homedir /media/usb/gnupg --recipient 0x3EE324A9B640B56C --encrypt | gpg --homedir /media/usb/gnupg --decrypt
gpg: encrypted with 4096-bit RSA key, ID 3D106246AB342382, created 2021-05-17
      "Grzegorz Baranski <root@gbaranski.com>"
hello there!
```

Repeat generating GPG key for each machine you want to use it on

### Exporting sub-keys

```bash
$ gpg --homedir /media/usb/gnupg --output /tmp/gpg-pubkey --export 0x613733AF902BDC4C
$ gpg --homedir /media/usb/gnupg --output /tmp/gpg-subkey --export-secret-subkeys 0x613733AF902BDC4C! 0x3EE324A9B640B56C!
$ gpg --homedir /media/usb/gnupg --export-ownertrust > /tmp/gpg-ownertrust
```
Where `0x613733AF902BDC4C` is primary key ID, and `0x3EE324A9B640B56C` is sub key ID we want to export

#### Importing sub-key on PC

We can now remove primary secret key, and add subkey

```bash
$ gpg --import /tmp/gpg-pubkey
$ gpg --import /tmp/gpg-subkey
$ gpg --import-ownertrust /tmp/gpg-ownertrust
$ rm /tmp/gpg-subkey /tmp/gpg-ownertrust
```

Verify that `gpg -K` shows `sec#` instead of just `sec` for primary key.
```bash
$ gpg -K
/home/gbaranski/.gnupg/pubring.kbx
----------------------------------
sec#  rsa4096 2021-05-17 [C]
      2561C4FA71384ADB4F3C64A8613733AF902BDC4C
uid           [ultimate] Grzegorz Baranski <root@gbaranski.com>
ssb   rsa4096 2021-05-17 [E]
```

Now we can set up `gopass` with previosuly created GitHub repository
```bash
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
[0] gpg - 0x613733AF902BDC4C - Grzegorz Baranski <root@gbaranski.com>
Please enter the number of a key (0-0, [q]uit) (q to abort) [0]:
Please enter an email address for password store git config []: root@gbaranski.com
❓ Do you want to add a git remote? [y/N/q]: Y
Configuring the git remote ...
Please enter the git remote for your shared store []: git@github.com:gbaranski/pass.git
```

And test if it works by adding example password and viewing it
```
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

$ gopass show websites/login.gbaranski.com/gbaranski
Secret: websites/login.gbaranski.com/gbaranski

hello
comment:
url: login.gbaranski.com
username: gbaranski
````


#### Importing sub-key on Android

Send keys to Android using [`croc`](https://github.com/schollz/croc)
```bash
$ croc send /tmp/gpg-subkey /tmp/gpg-pubkey
Sending 2 files (6.8 kB)
Code is: 8043-dynamic-gong-resume
On the other computer run

croc 8043-dynamic-gong-resume

Sending (->192.168.1.10:49316)
gpg-subkey 100% |████████████████████| (3.5/3.5 kB, 1.378 MB/s) 1/2
gpg-pubkey 100% |████████████████████| (3.3/3.3 kB, 1.205 MB/s) 2/2
```

To use import PGP Keys on Android, we use OpenKeychain app, available in [`F-Droid`](https://f-droid.org/en/packages/org.sufficientlysecure.keychain/).
First import gpg-pubkey, and then gpg-subkey



### Exporting keys to Android


Import PGP Keys in OpenKeychain app, available in 


# Setting up gopass password manager

### Creating new Github repository

We will store passwords in Github private repository(although it can be anywhere), create Github repo using
```
gh repo create pass
```

### Adding new password in gopass

[Install](https://github.com/gopasspw/gopass) `gopass`

Initialize password store using `gopass setup`, add new passwords using `gopass create`. 


### Using password sfrom PC on Android

Sync gopass with remote using `gopass sync`

Open [Android-Password-Store](https://github.com/android-password-store/Android-Password-Store) and select "Clone remote repo". I'm using `git@github.com:gbaranski/pass.git` as repository URL, and SSH Key as authentication mode. After pulling from repo, all should work, read passwords using GPG Key we previously uploaded using `croc`.
