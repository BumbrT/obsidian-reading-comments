# Obsidian Reading Comments - Комментарии для чтения в Obsidian

Плагин позволяет добавлять html комментарии при чтении книг или статей markdown в Obsidian. Родные %%комментарии%% Obsidian так-же поддерживаются. Комментарии можно группировать иерархически с помощью тэгов (см. иллюстрации ниже). Затем из заметки с комментариями можно выгрузить отдельную заметку, где будут только комментарии, а также оригинальную заметку, где будут ссылки на эти комментарии с форматированием в чистом markdown - без html.

[Тема на форуме Obsidian](https://forum.obsidian.md/t/new-plugin-obsidian-reading-comments/)

## Использование

### Добавить комментарий к выделенному тексту

Выделите текст, откройте панель команд и выполните команду `Add reading comment for selection`.

Лучше назначить горячую клавишу для данного действия.

В поле "data-tags" можно через запятую указать тэги, поддерживается иерархия: Родитель/Дочерний тэг.

### Открыть панель со списком комментариев:

Выполните команду `Reading Comments Panel`.

### Выгрузить оригинальную заметку со ссылками на заметку с комментариями

Выполните команду `Extract original note with links to comments note`.

## Возможности

- Иерархическая группировка комментариев: тэги вида "Parent/Child/Etc" поддерживаются и группируются в панели комментариев
- Поиск по комментариям
- При клике по комментарию в панели, курсор в редакторе будет установлен на него. Родные %%комментарии%% Obsidian так-же поддерживаются.
- **Выгрузка заметки со ссылками на комментарии в markdown**
- Горячая клавиша удаления комментария
- Комментарии в виде блока/строк и переключение между ними по горячей клавише
- Комментарий скрыт до наведения курсора на комментируемый текст
- Цвета комментариев в настройках
- Поддержка светлой и темной темы

## Демонстрация

### Добавить комментарий

![Create comment](https://raw.githubusercontent.com/BumbrT/obsidian-reading-comments/master/resources/create-comment-ru.gif)

### Поиск комментариев

![Search comments](https://raw.githubusercontent.com/BumbrT/obsidian-reading-comments/master/resources/navigate-comment-ru.gif)

### Выгрузка оригинальной заметки в markdown

![Extract original note](https://raw.githubusercontent.com/BumbrT/obsidian-reading-comments/master/resources/extract-original-ru.gif)


## Установка

- Установите из плагинов сообщества [Obsidian Community plugins](https://obsidian.md/plugins?id=reading-comments)
- Используйте плагин [obsidian BRAT](https://github.com/TfTHacker/obsidian42-brat) со ссылкой на данный репозиторий
- Можно загрузить вручную со страницы [Release page](https://github.com/BumbrT/obsidian-reading-comments/releases) и скопировать в папку: vault/.obsidian/plugins folder. Должны быть включены плагины сообщества (Community plugins).

## FAQ по настройке
### Как добавить кастомную иконку после комментария
- Добавьте касотный CSS [в obsidian](https://help.obsidian.md/Extending+Obsidian/CSS+snippets)
- Выберите иконку и скопируйте SVG из [Lucide](https://lucide.dev/icons/) или любого другого источника
- Добавьте слудющий CSS:
```css
.ob-html-comment:after {
    background: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXN0aWNreS1ub3RlIj48cGF0aCBkPSJNMTUuNSAzSDVhMiAyIDAgMCAwLTIgMnYxNGMwIDEuMS45IDIgMiAyaDE0YTIgMiAwIDAgMCAyLTJWOC41TDE1LjUgM1oiLz48cGF0aCBkPSJNMTUgM3Y2aDYiLz48L3N2Zz4=");
    content: "";
    background-repeat: no-repeat;
    width: 16px;
    height: 16px;
    background-color: white;
    display: inline-block;
}
```
- Поиграйте с высотой, шириной и цветом в CSS

## Детали реализации

### Логика комментариев

Основная логика содержится в файле src/comments/ConstantsAndUtils.ts
 При выполнении команды `Add reading comment for selection` , выделенное в редакторе заменяется на:

```html
<div class="ob-html-comment" id="comment-${commentId}" data-tags="[comment,]"><span class="ob-html-comment-body">CommentPlaceholder</span>${htmlEscapedSelection}</div>
```

Затем плагин анализирует текст заметки и выгружает комментарии на отдельную панель.

### Логика отображения

Находится в файлах: styles.css и src/HtmlCommentsTemplate.vue

## Спасибо

Реализация взята из  плагина [Obsidian Quiet Outline](https://github.com/guopenghui/obsidian-quiet-outline).
Идея взята из плагина [Comments](https://github.com/Darakah/obsidian-comments-plugin).
