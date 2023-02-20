# Obsidian Reading Comments
Plugin allows to create inline html comments while reading markdown notes in Obsidian.

[Readme на русском](https://github.com/BumbrT/obsidian-reading-comments/blob/master/README-RU.md)

## Usage
### Insert a comment:
Open command panel and type `Add reading comment for selection` ，then press `Enter` .

It's recommended to assign hotkey for this command panel action.

You can use hierarchical Parent/Child tags in "data-tags" field.

### Open comments panel:
Open command panel and type `Reading Comments Panel`.

### Extract original note with links to comments note
Open command panel and type `Extract original note with links to comments note`.

## Features
- Tag comments hierarchically: Parent/Child/Etc tags supported and grouped by parent in the panel
- Search in comments
- Navigate to particular comment by click
- **Extract original note with links to comments note**
- Remove selected comment by hotkey
- Toggle selected comment to block/inline by hotkey
- Hide comment until commented text body is hovered
- Pick comment color from settings
- Dark and light theme support

## Showcase
### Buy me a coffee
If you enjoy this plugin, feel free to buy me a coffee.
<a href="https://www.buymeacoffee.com/bumbrtg"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=thtree&button_colour=40DCA5&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00" /></a>

### Create comment:

![Create comment](https://raw.githubusercontent.com/BumbrT/obsidian-reading-comments/master/resources/create-comment-ru.gif)

### Search comments in the panel:

![Search comments](https://raw.githubusercontent.com/BumbrT/obsidian-reading-comments/master/resources/navigate-comment-ru.gif)

### Extract original note with links to comments note:

![Extract original note](https://raw.githubusercontent.com/BumbrT/obsidian-reading-comments/master/resources/extract-original-ru.gif)

### Buy me a coffee
If you enjoy this plugin, feel free to buy me a coffee.
<a href="https://www.buymeacoffee.com/bumbrtg"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=thtree&button_colour=40DCA5&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00" /></a>

## Installation
- Install from obsidian community plugins store
- Use [obsidian BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin with github link to this repo
- Or download latest release file from [Release page](https://github.com/BumbrT/obsidian-reading-comments/releases) and put files to your vault/.obsidian/plugins folder. Community plugins should be enabled.

## Implementation details for DIY plugin modifications and pull requests
### Comments logic
Most important logic located in src/comments/ConstantsAndUtils.ts
 When `Add reading comment for selection` executed, editor selection replaced with the following code:
```
<div class="ob-html-comment" id="comment-${commentId}" data-tags="[comment,]"><span class="ob-html-comment-body">CommentPlaceholder</span>${htmlEscapedSelection}</div>
```
Plugin parses text for comments and organizes them in panel hierarchically by tags.

### Display logic
All styles and display logic are located in styles.css and src/HtmlCommentsTemplate.vue files.


## Thanks
Implementation has been based on the [Obsidian Quiet Outline](https://github.com/guopenghui/obsidian-quiet-outline) plugin.
Basic idea has been taken from the [Comments](https://github.com/Darakah/obsidian-comments-plugin) plugin.

## Buy me a coffee
If you enjoy this plugin, feel free to buy me a coffee.
<a href="https://www.buymeacoffee.com/bumbrtg"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=thtree&button_colour=40DCA5&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00" /></a>


## Roadmap:
- Multiline comments support (refactoring line by line parsing to multiline).
- Tab for comments in whole vault/folder
- Tags renaming in the tree, drag&drop, etc tags and comments management

### To introduce "nice to have" features, create issue here or better donate with "buy me a coffee" website
### "Nice to have" features:
- tags and comments ordering algo in settings
- customize tags placeholder(for now "comment,")




