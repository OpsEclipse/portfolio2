# Figma Header Bar Design

## Summary

Implement only the Figma header bar from node `286:204`.

The header has two parts:

- Left: hard-coded `Sparsh Shah` text with a small hard-coded `18`
- Right: a dynamic overlapping strip of playlist images loaded from `public/playlist-images`

The image list must not be hard-coded in the component. Adding another image file to the folder should automatically add another item to the rendered strip.

## Goals

- Match the visible Figma header layout as closely as possible
- Use the exact Figma images for the playlist strip
- Store those images in `public/playlist-images`
- Render the playlist strip from a folder-driven array with `.map()`
- Keep the implementation small and isolated from the rest of the page

## Non-Goals

- Rebuild the full Figma page
- Make the left-side text data-driven
- Change unrelated portfolio sections

## Structure

Create a focused header component, `PlaylistHeader`, and render it near the top of the home page.

Responsibilities:

- `app/page.jsx`: load the playlist image paths on the server and pass them into the header
- `src/components/PlaylistHeader.jsx`: render the left text block and the overlapping image strip
- `src/lib/playlistImages.js`: expose a small helper that reads `public/playlist-images`, filters valid image files, sorts them, and returns public URLs

This keeps file-system logic separate from rendering logic.

## Data Flow

The page will read the contents of `public/playlist-images` with `fs` [Node's file system API, which reads files and folders on disk].

The helper will:

- read the folder
- keep only image files such as `.png`, `.jpg`, `.jpeg`, `.webp`, and `.gif`
- sort the filenames in a stable order
- convert them into `/playlist-images/<filename>` paths

The component will receive that array and render it with `.map()` [a way to turn each item in a list into UI].

## Visual Design

Match the visible Figma frame:

- overall desktop header footprint: about `640px` wide and `48px` tall
- strong black headline on a very light background
- large name text on the left
- small `18` aligned near the top-right of the name group
- playlist images on the right as `48x48` rounded squares
- overlapping image treatment using negative horizontal spacing [spacing that pulls items partly on top of each other]

Responsive behavior:

- preserve the same visual language on smaller screens
- allow the layout to shrink or wrap instead of overflowing badly

## Asset Handling

The implementation uses the exact Figma playlist images.

Those files will be downloaded and added to:

- `public/playlist-images`

The rendering logic will automatically pick up new files placed in that folder.

## Error Handling

- If the folder exists but is empty, the header still renders the left text and shows no playlist images
- If the folder is missing, the helper should fail safely and return an empty array rather than crashing the page

## Testing

Add a small testable helper for image discovery.

Verify:

- only valid image files are returned
- results are sorted predictably
- missing or empty folder returns an empty list

Also verify the app still builds after the change.

## Implementation Notes

- Keep the header implementation isolated
- Avoid hard-coding any playlist filenames in JSX
- Use the existing project styling approach
- Preserve current page behavior outside the header area
