// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::sync::Mutex;
use tauri::{AppHandle, Manager, PhysicalPosition, PhysicalSize, WebviewUrl};
use tauri_plugin_updater::UpdaterExt;

// Track if the window has been split
struct AppState {
    is_split: Mutex<bool>,
}

#[tauri::command(async)]
async fn split_window_with_url(app: AppHandle, url: String) -> Result<(), String> {
    println!("[lib.rs] split_window_with_url called with URL: {}", url);

    // Get the state
    let state = app.state::<AppState>();
    let should_close = {
        let is_split = state.is_split.lock().unwrap();
        println!("[lib.rs] Current is_split state: {}", *is_split);
        *is_split
    };

    if should_close {
        println!("[lib.rs] Window is already split, closing existing webview");
        close_external_webview(app.clone()).await?;
    }

    // Get the main window (using get_window for unstable features)
    println!("[lib.rs] Getting main window");
    let window = app.get_window("main").ok_or("Main window not found")?;

    // Get the current window size
    let size = window
        .outer_size()
        .map_err(|e| format!("Failed to get window size: {}", e))?;

    let width = size.width;
    let height = size.height;
    println!("[lib.rs] Window size: {}x{}", width, height);

    // Parse the URL
    println!("[lib.rs] Parsing URL: {}", url);
    let external_url = url.parse().map_err(|_| format!("Invalid URL: {}", url))?;
    println!("[lib.rs] URL parsed successfully");

    // Create right webview (external URL)
    println!(
        "[lib.rs] Creating right webview at position: ({}, 0) with size: {}x{}",
        width / 2,
        width / 2,
        height
    );

    
    let _webview_right = window
        .add_child(
            tauri::webview::WebviewBuilder::new(
                "external_webview",
                WebviewUrl::External(external_url),
            )
            .auto_resize(),
            PhysicalPosition::new(width / 2, 0),
            PhysicalSize::new(width / 2, height),
        )
        .map_err(|e| format!("Failed to create right webview: {}", e))?;

    _webview_right.set_size( PhysicalSize::new(width / 2, height)).map_err(|e| format!("Failed to set size for right webview: {}", e))?;
    _webview_right.set_position( PhysicalPosition::new(width / 2, 0)).map_err(|e| format!("Failed to set position for right webview: {}", e))?;
    println!("[lib.rs] Right webview created successfully");
    _webview_right.show().map_err(|e| format!("Failed to show right webview: {}", e))?;
    // Mark as split
    {
        let mut is_split = state.is_split.lock().unwrap();
        *is_split = true;
        println!("[lib.rs] Window marked as split");
    }

    println!("[lib.rs] split_window_with_url completed successfully");
    Ok(())
}

#[tauri::command]
async fn close_external_webview(app: AppHandle) -> Result<(), String> {
    println!("[lib.rs] close_external_webview called");
    let state = app.state::<AppState>();
    let mut is_split = state.is_split.lock().unwrap();

    if !*is_split {
        println!("[lib.rs] Window is not split, cannot close");
        return Err("Window is not split".to_string());
    }
    println!("[lib.rs] Getting external webview");
    let window = app.get_window("main").ok_or("Main window not found")?;
    let webview = window
        .get_webview("external_webview")
        .ok_or("External webview not found")?;

    println!("[lib.rs] Closing external webview");
    webview.set_auto_resize(false).map_err(|e| format!("Failed to disable auto-resize for external webview: {}", e))?;
    webview.set_size(PhysicalSize::new(0, 0)).map_err(|e| format!("Failed to resize external webview: {}", e))?;
    webview.set_position(PhysicalPosition::new(0, 0)).map_err(|e| format!("Failed to reposition external webview: {}", e))?;

    webview
        .close()
        .map_err(|e| format!("Failed to close external webview: {}", e))?;

    *is_split = false;
    println!("[lib.rs] External webview closed successfully, is_split set to false");

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    println!("[lib.rs] Starting Tauri application");
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            println!("[lib.rs] Running setup");
            // Initialize app state
            app.manage(AppState {
                is_split: Mutex::new(false),
            });
            println!("[lib.rs] App state initialized with is_split = false");

            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                println!("[lib.rs] Checking for updates");
                (update(handle).await).expect("updating failed");
            });
            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            split_window_with_url,
            close_external_webview
        ])
        .on_webview_event(|window, event| match event {
            tauri::WebviewEvent::DragDrop(event) => {
                println!("{:?}", window.label());
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn update(app: tauri::AppHandle) -> Result<(), tauri_plugin_updater::Error> {
    println!("[lib.rs] Checking for updates...");
    if let Some(update) = app.updater()?.check().await? {
        println!("[lib.rs] Update available, starting download");
        let mut downloaded = 0;

        // alternatively we could also call update.download() and update.install() separately
        update
            .download_and_install(
                |chunk_length, content_length| {
                    downloaded += chunk_length;
                    println!("[lib.rs] downloaded {downloaded} from {content_length:?}");
                },
                || {
                    println!("[lib.rs] download finished");
                },
            )
            .await?;

        println!("[lib.rs] update installed, restarting app");
        app.restart();
    } else {
        println!("[lib.rs] No updates available");
    }

    Ok(())
}
