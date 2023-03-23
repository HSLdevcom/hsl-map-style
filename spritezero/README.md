# Spritezero instructions

## Installation

Requirements:
- node v16
- yarn package manager

```
yarn install
```

## How to add new icons

1. Download new icons as svg to your machine. Rename them logically.
2. (Optional step) Resize the icons to match the current ones. You can use rsvg-convert to do it.
```
# Installation
sudo apt install librsvg2-bin

# Resize to the size 16x16 (or somewhat similar, depending of the aspect ratio of the icon)
rsvg-convert -w 16 -h 16 -f svg icon.svg > resized-icon.svg

# The batch process example
for i in $(find new-icons/*.svg -printf "%f\n"); do rsvg-convert -w 16 -h 16 -f svg new-icons/$i > test-icons/$i; done;
```
3. Place the icons in the root of `map-icons` directory
4. Run the script:
```
yarn run icons
```
5. Check that new icons are in `sprite.png`

Now the icons should be available through the sprite.

6. Upload the newest sprite into Karttatuotanto Azure blob storage, overwriting the older sprite files.
