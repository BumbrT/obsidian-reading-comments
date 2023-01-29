# Obsidian Reading Comments
Plugin allows to create inline html comments while reading markdown notes in Obsidian.

[Readme на русском](https://github.com/BumbrT/obsidian-reading-comments/blob/master/README-RU.md)

## Usage
Insert a comment: Open command panel and type `Add reading comment for selection` ，then press `Enter` .
It's recommended to assign hotkey for this command panel action. You can use hiaearchical Parent/Child tags in "data-tags" field.

Open comments panel: Open command panel and type `Reading comments` ，then press `Enter` .

## Features
- Tag comments hierarchically: Parent/Child/Etc tags supported and grouped by parent in the panel.
- Search in comments
- Navigate to particular comment by click
- Hide comment until commented text body is hovered
- Dark and light theme support

## Showcase
Create comment:

![Create comment](https://raw.githubusercontent.com/BumbrT/obsidian-reading-comments/master/resources/create-comment-ru.gif)

Search comments in the panel:

![Search comments](https://raw.githubusercontent.com/BumbrT/obsidian-reading-comments/master/resources/navigate-comment-ru.gif)

## Implementation details for DIY plugin modifications and pull requests
Most important logic located in src/comments/ConstantsAndUtils.ts
 When `Add reading comment for selection` executed, editor selection replaced with the following code:
```
<div class="ob-html-comment" id="comment-${commentId}" data-tags="[comment,]"><span class="ob-html-comment-body">CommentPlaceholder</span><pre>${htmlEscapedSelection}</pre></div>
```
Plugin applies styles to show comment only when commented text is hovered and highlights commented text.
Plugin parses text for comments and organizes them in panel hierarchically by tags.



## Thanks
Implementation has been based on [Obsidian Quiet Outline](https://github.com/guopenghui/obsidian-quiet-outline) plugin.
Basic idea has been taken from [Comments plugin](https://github.com/Darakah/obsidian-comments-plugin)


## Nice to have features: create issue with request or better donate with "buy me a coffe" website
### Possible features:
- delete comment (or just clear html in selection with marked or remark)
- tags and comments ordering algo in settings
- handle scroll
- add to settings tags placeholder: "comment," used by default


