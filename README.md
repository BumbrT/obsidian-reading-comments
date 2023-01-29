# Obsidian Reading Comments
Plugin allows to create inline html comments while reading markdown notes in Obsidian.

[Readme на русском](https://github.com/BumbrT/obsidian-reading-comments/blob/master/README-RU.md)

## Usage
Insert a comment: Open command panel and type `Add reading comment for selection` ，then press `Enter` .

It's recommended to assign hotkey for this command panel action.

You can use hiaearchical Parent/Child tags in "data-tags" field.

Open comments panel: Open command panel and type `Reading comments` ，then press `Enter` .

## Features
- Tag comments hierarchically: Parent/Child/Etc tags supported and grouped by parent in the panel.
- Search in comments
- Navigate to particular comment by click
- Hide comment until commented text body is hovered
- Dark and light theme support (app restart required)

## Showcase
### Buy me a coffee
If you enjoy this plugin, feel free to buy me a coffee.
<a href="https://www.buymeacoffee.com/bumbrtg"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=thtree&button_colour=40DCA5&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00" /></a>

### Create comment:

![Create comment](https://raw.githubusercontent.com/BumbrT/obsidian-reading-comments/master/resources/create-comment-ru.gif)

### Search comments in the panel:

![Search comments](https://raw.githubusercontent.com/BumbrT/obsidian-reading-comments/master/resources/navigate-comment-ru.gif)

### Buy me a coffee
If you enjoy this plugin, feel free to buy me a coffee.
<a href="https://www.buymeacoffee.com/bumbrtg"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=thtree&button_colour=40DCA5&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00" /></a>

## Installation
- Install from obsidian community plugins store
- Or download latest release .zip file from [Release page](https://github.com/BumbrT/obsidian-reading-comments/releases) and extract to your vaulut/.obsidian/plugins folder. Community plugins should be anabled.

## Implementation details for DIY plugin modifications and pull requests
### Comments logic
Most important logic located in src/comments/ConstantsAndUtils.ts
 When `Add reading comment for selection` executed, editor selection replaced with the following code:
```
<div class="ob-html-comment" id="comment-${commentId}" data-tags="[comment,]"><span class="ob-html-comment-body">CommentPlaceholder</span><pre>${htmlEscapedSelection}</pre></div>
```
Plugin parses text for comments and organizes them in panel hierarchically by tags.

### Display logic
All styles and display logic located in styles.css and src/HtmlCommentsTemplate.vue files.


## Thanks
Implementation has been based on [Obsidian Quiet Outline](https://github.com/guopenghui/obsidian-quiet-outline) plugin.
Basic idea has been taken from [Comments plugin](https://github.com/Darakah/obsidian-comments-plugin)

## Buy me a coffee
If you enjoy this plugin, feel free to buy me a coffee.
<a href="https://www.buymeacoffee.com/bumbrtg"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=thtree&button_colour=40DCA5&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00" /></a>


## Nice to have features: create issue with request or better donate with "buy me a coffe" website
### Possible features:
- delete comment (or just clear html in selection with marked or remark)
- tags and comments ordering algo in settings
- handle scroll
- add to settings tags placeholder: "comment," used by default


