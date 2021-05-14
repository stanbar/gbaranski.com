+++
title = "Creating ncurses-like TUI Applications in Rust using Cursive"
date = 2021-05-12
author = "gbaranski"
tags = ["rust", "cursive", "tui", "houseflow"]
description = """A post describing creating a TUI application in Rust for the [Houseflow](/projects/#houseflow) project. It enables triggering events, like turning on lights, on connected IoT devices. 
"""
showFullContent = false

+++

{{< rawhtml >}}
<p>
  <img src="/img/rust-tui/cover.png"
</p>
{{< /rawhtml >}}

## Introduction

A post describing creating a TUI application in Rust for the [Houseflow](/projects/#houseflow) project. 
It enables triggering events, like turning on lights, on connected IoT devices. 

## Goal

Create CLI application for the the [Houseflow](/projects/#houseflow) backend, similar to the [`ncspot`](https://github.com/hrkfdn/ncspot) client for the Spotify, using the cursive.

Create something similar to [`ncspot`](https://github.com/hrkfdn/ncspot), a Spotify client in CLI that uses the [`cursive`](https://github.com/gyscos/cursive).

![screenshot of running ncspot](/img/ncspot-screenshot.png)

## Getting started

The first step is to initialize an empty project

```bash
cargo new --bin rust-blog-tui
```

This will create a directory with the given name and few files inside. Let's start by adding [`cursive`](https://github.com/gyscos/cursive) crate to dependencies, [here is why I chose it](#why-cursive), and also [`anyhow`](https://github.com/dtolnay/anyhow) for easier error handling. That's how our `Cargo.toml` shoud look like:

```toml
# Cargo.toml

[package]
name = "rust-blog-tui"
version = "0.1.0"
edition = "2018"

[dependencies]
cursive = "0.16"
anyhow = "1.0"
```


### Setting up UI

The first step is showing a simple UI in our `main` function inside `src/main.rs` file

```rust
// src/main.rs

use cursive::views::{Dialog, TextView};

fn main() -> anyhow::Result<()> {
    // Creates the cursive root - required for every application.
    let mut siv = cursive::default();

    // Creates a dialog with a single "Quit" button
    siv.add_layer(Dialog::around(TextView::new("Hello Dialog!"))
                         .title("Cursive")
                         .button("Quit", |s| s.quit()));

    // Starts the event loop.
    siv.run();

    Ok(())
}
```

Notice the return type of the `main` function. We're using `Result` from the `anyhow` crate, which will allow us to return `anyhow::Error` directly from the `main` function.

We can now test if it works by running

```bash
cargo run
```

What we should see is a screen with a simple Dialog.

![screenshot of program with dialog on middle of the screen](/img/rust-tui/basic.png)


### Defining types for Device

Let's define some types which we will use for storing devices in memory

```rust
// src/device.rs

/// Used to identify the device
#[derive(Debug, Clone)]
pub struct DeviceID {
    inner: [u8; 16],
}

#[derive(Debug, Clone)]
pub struct Device {
    pub id: DeviceID,
}
```

And use them inside `main.rs`

```rust
// src/main.rs

mod device;
use device::{Device, DeviceID};
```

### Generating fake devices

Since we're not operating on real devices yet, we'll generate fake devices. For the source of randomness, we'll use [`rand`](https://lib.rs/crates/rand). Add the following line to our `Cargo.toml` dependencies section

```toml
# Cargo.toml

# ...
[dependencies]
rand = "0.8"
# ...
```

##### Random Device IDs

To generate a DeviceID using `rand`, we'll need to implement a Distribution for it

```rust
// src/device.rs

use rand::distributions;

impl distributions::Distribution<DeviceID> for distributions::Standard {
    fn sample<R: rand::Rng + ?Sized>(&self, rng: &mut R) -> DeviceID {
        DeviceID { inner: rng.gen() }
    }
}
```

##### Iter of random devices

Since we've got the function that generates random DeviceID, we can create a new function that returns an infinite Iterator of Devices with random DeviceID

```rust
// src/device.rs

/// Creates a infinite Iterator of fake devices
pub fn get_devices() -> impl Iterator<Item = Device> {
    std::iter::repeat_with(|| Device { id: rand::random() })
}
```

Import this function inside `main.rs`

```rust
// src/main.rs

use device::{Device, DeviceID, get_devices};
```

### Displaying a list of devices to the user

To present `DeviceID` to the user, we need to implement the `std::fmt::Display` trait. We're going to use the hex encoding of inner bytes so that we need to add the [`hex`](https://lib.rs/crates/hex) crate. Let's add it to our `Cargo.toml`'s dependencies section.

```toml
# Cargo.toml

# ...
[dependencies]
hex = "0.4"
# ...
```

And implementation of the `std::fmt::Display` trait for the `DeviceID`

```rust
// src/device.rs

use std::fmt;

impl fmt::Display for DeviceID {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", hex::encode(self.inner))
    }
}
```

##### SelectView

To display a list of the devices on which we can click, we use [`SelectView`](https://docs.rs/cursive/0.16.3/cursive/views/struct.SelectView.html)

```rust
// src/main.rs

use cursive::{views::SelectView, Cursive, View};

/// Returns SelectView whichs shows all available devices to the user
fn get_devices_select_view(
    devices: Vec<Device>,
    submit_callback: impl 'static + Fn(&mut Cursive, Device),
) -> impl View {
    let devices_cursive_iter = devices
        .iter()
        .enumerate()
        .map(|(index, device)| (device.id.to_string(), index));

    let mut view = SelectView::new();
    view.add_all(devices_cursive_iter);
    view.set_on_submit(move |siv, index| {
        let device = devices.get(*index).unwrap();
        submit_callback(siv, device.clone())
    });
    view
}
```

And now show it to the user in `main` function

```rust
// src/main.rs

fn main() -> anyhow::Result<()> {
    // Creates the cursive root - required for every application.
    let mut siv = cursive::default();

    let devices = get_devices().take(10).collect();
    let devices_select_view = get_devices_select_view(devices, |siv, _device| siv.quit());

    // Create a dialog with devices select view
    siv.add_layer(Dialog::around(devices_select_view));

    // Starts the event loop.
    siv.run();

    Ok(())
}
```

The result is

![screenshot of program with selectview](/img/rust-tui/selectview.png)

So far so good.

#### Showing a dialog to the user on submit callback

Currently, selecting a particular device closes the program. We fix it by displaying a Dialog with the available options for the specific device.

```rust
// src/main.rs

fn submit_callback(siv: &mut Cursive, device: Device) {
    let text_view = TextView::new("Select what to do with the device");
    let dialog_title = format!("Selected device: {}", device.id);
    let dialog = Dialog::around(text_view)
        .title(dialog_title)
        .button("Send Command", |siv| siv.quit())
        .button("Cancel", |siv| {
            siv.pop_layer();
        });

    siv.add_layer(dialog);
}

```

And use it in the `main` function

```rust
// src/main.rs

fn main() -> anyhow::Result<()> {
    // Creates the cursive root - required for every application.
    let mut siv = cursive::default();

    let devices = get_devices().take(10).collect();
    let devices_select_view = get_devices_select_view(devices, submit_callback);

    // Create a dialog with devices select view
    siv.add_layer(Dialog::around(devices_select_view));

    // Starts the event loop.
    siv.run();

    Ok(())
}
```

Now we can select a specific device, and the dialog shows up

![screenshot of program with selectview with dialog](/img/rust-tui/dialog-popup.png)

#### Sending HTTP request with Send Command button

Right now, the "Send Command" button closes our program. To fix that, we add a sending HTTP Request function. We start with adding the [`reqwest`](https://lib.rs/crates/reqwest) and the [`cursive-async-view`](https://lib.rs/crates/cursive-async-view) libraries for displaying a loader.

Add them to the dependencies section in our `Cargo.toml` 

```toml
# Cargo.toml

# ...
[dependencies]
cursive-async-view = "0.5"
reqwest = { version = "0.11", default-features = false, features = [ "blocking" ] }
# ...
```

Add a function that will be called on the "Send Command" button press

```rust
// src/main.rs

use cursive_async_view::AsyncView;

fn send_command(siv: &mut Cursive, _device: &Device) {
    let client = reqwest::blocking::Client::new();
    let request = client.post("http://httpbin.org/delay/1");
    let async_view = AsyncView::new_with_bg_creator(
        siv,
        move || match request.send() {
            Ok(response) => Ok(response.status().to_string()),
            Err(err) => Err(err.to_string()),
        },
        TextView::new,
    );
    let async_view_width = siv.screen_size().x / 3;
    let async_view = Dialog::around(async_view.with_width(async_view_width)).button("Ok", |siv| {
        siv.pop_layer();
    });
    siv.add_layer(async_view);
}
```


Update the `submit_callback` to call that function
```rust
// src/main.rs

fn submit_callback(siv: &mut Cursive, device: Device) {
    let text_view = TextView::new("Select what to do with the device");
    let dialog_title = format!("Selected device: {}", device.id);
    let dialog = Dialog::around(text_view)
        .title(dialog_title)
        .button("Send Command", move |siv| send_command(siv, &device))
        .button("Cancel", |siv| {
            siv.pop_layer();
        });

    siv.add_layer(dialog);
}
```

![gif of program sending http request](/img/rust-tui/send-http-request.gif)

## Fixing the movement

Currently, we need to use arrow keys for the navigation, which is quite inconvenient. Let's add the h/j/k/l navigation——just like in Vim.


```rust
// src/main.rs

use cursive::{
    event::EventResult,
    views::{OnEventView, SelectView},
    Cursive, View,
};

/// Returns SelectView whichs shows all available devices to user
fn get_devices_select_view(
    devices: Vec<Device>,
    submit_callback: impl 'static + Fn(&mut Cursive, Device),
) -> impl View {
    let devices_cursive_iter = devices
        .iter()
        .enumerate()
        .map(|(index, device)| (device.id.to_string(), index));

    let mut view = SelectView::new();
    view.add_all(devices_cursive_iter);
    view.set_on_submit(move |siv, index| {
        let device = devices.get(*index).unwrap();
        submit_callback(siv, device.clone())
    });
    OnEventView::new(view)
        .on_pre_event_inner('k', |siv, _| {
            let cb = siv.select_up(1); // Move up
            Some(EventResult::Consumed(Some(cb)))
        })
        .on_pre_event_inner('j', |siv, _| {
            let cb = siv.select_down(1); // Move down
            Some(EventResult::Consumed(Some(cb)))
        })
}
```

Also inside the Dialogs

```rust
use cursive::{
    direction::{Absolute, Direction},
    event::{Event, EventTrigger},
};

fn submit_callback(siv: &mut Cursive, device: Device) {
    let text_view = TextView::new("Select what to do with the device");
    let dialog_title = format!("Selected device: {}", device.id);
    let dialog = Dialog::around(text_view)
        .title(dialog_title)
        .button("Send Command", move |siv| send_command(siv, &device))
        .button("Cancel", |siv| {
            siv.pop_layer();
        });
    let dialog = OnEventView::new(dialog)
        .on_pre_event_inner(
            EventTrigger::none()
                .or(Event::Char('h'))
                .or(Event::Char('k')),
            |siv, _| {
                siv.take_focus(Direction::Abs(Absolute::Left));
                Some(EventResult::Consumed(None))
            },
        )
        .on_pre_event_inner(
            EventTrigger::none()
                .or(Event::Char('l'))
                .or(Event::Char('j')),
            |siv, _| {
                siv.take_focus(Direction::Abs(Absolute::Right));
                Some(EventResult::Consumed(None))
            },
        );

    siv.add_layer(dialog);
}
```

The complete source code is available on the [Github repo](https://github.com/gbaranski/houseflow/tree/881977b8606fe554c6dc5aed38d916ad7f0efab2/tui) as a part of the [Houseflow](/projects#houseflow) project.


## Why cursive?

I've chosen it over [`tui-rs`](https://github.com/fdehau/tui-rs) because the `cursive` provides a lot of nice built-in widgets and suits better to my use-case; you can check out the comparison made by `cursive` [here](https://github.com/gyscos/cursive/wiki/Cursive-vs-tui%E2%80%90rs).
