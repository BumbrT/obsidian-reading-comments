import { describe, expect, test } from '@jest/globals';
import { TextToTreeDataParser } from "../comments/TextToTreeDataParser";
import { constantsAndUtils } from '../comments/ConstantsAndUtils';


describe("export parsed comments as note", () => {
    test("should export parsed comments as note", () => {
        const parser = new TextToTreeDataParser(textToAnalyse);
        const result = constantsAndUtils.exportParsetCommentsToCommentsNote(parser.parsedComments);
        expect(result.length).toBeGreaterThan(0);
    });

});

const textToAnalyse = `I[[Comments Как читать книги]]
#gg
# Ключевые слова в комментариях

Rule* ( Common, One, Two, Three, Four, Practice, Theory, Hud) - описание правила чтения
Struct - структура книги (кратко методы и способы чтения)
Tip - **практический** совет
Class - классификация книг, наук

**
Мортимер Адлер

Как читать книги. Руководство по чтению великих произведений
**

# Предисловие

*
— Ну, что? Читали книгу?

— Читал, ваше превосходительство.

— О чем же вы читали, любезнейший? А ну-ка, расскажите\! <…>

— Забыл, ваше превосходительство <…>

— Значит, вы не читали или, э-э-э… невнимательно читали\! Авто-мма-тически\! Так нельзя\!

А. П. Чехов. Чтение
*



![](images/000000.png)

Эврика\! Мы не умеем читать\!

<span class="ob-html-comment" id="comment-3ffae302-265b-4949-bcf5-60c6861f7e11" data-tags="[]"><span class="ob-html-comment-body">Coment without tag</span>Казалось бы, на протяжении многих столетий книга была основным инструментом знаний в руках народов. Вспоминая ее историю — как она зарождалась, как распространялась на выбитых камнях, глиняных табличках, свитках, как «боролась» за свое существование, — мы убеждаемся, насколько мало знаем и ценим то, что имеем.</span>

Постиндустриальный век дал человеку новые возможности в получении информации. Теперь кто-то списывает, кто-то скачивает, кто-то копирует, получая знания схоластически. Читатель великих произведений постепенно уступает место потребителю информации, который, словно в чужую обитель, входит в текст и тут же выходит, не задержавшись, чтобы подхватить протянутые ему зерна для размышления.

<div class="ob-html-comment" id="comment-c169c557-8964-4312-82ca-a9ba85d2af6b" data-tags="[Rule/One]"><span class="ob-html-comment-body">CommentPlaceholder</span>Скользя взглядом по «контенту», выхватывая фрагменты мыслей и идей, мы считаем, что нашли истину, но, увы, это всего лишь «гуляющий ветер», влетающий в одно ухо и вылетающий в другое. И, как мираж, тает глубина познания. Мы не достигаем «потолка» в чтении великих книг, зачастую даже самим себе не можем сказать: я научился читать, я научился понимать, я вижу душу писателя, который донес до меня свой мир, свои переживания, свой опыт.</div>

Эта книга, написанная еще до Второй мировой войны, актуальна сегодня, возможно, даже больше, чем тогда: беспрецедентна скудость следа современного информационного потока, бегущего с экранов компьютеров и телевизоров. Конечно, Интернет всколыхнул общество, и мы увидели новый срез моды, когда все чаще стали говорить об электронных библиотеках, о том, что скачивают много книг и обладают огромным цифровым богатством. Но что скачивают? Зачем? Чувствуют ли формальность этих действий? Знают ли, кто создал эти книги? Понимают ли тех людей, которые старались донести до нас свои идеи, возможно, соединить свое прошлое с настоящим для трансформации в будущее? Осознают ли, что «нет смысла разговаривать с предками, не научившись слушать»? Стеклянная броня электронного носителя информации становится в некотором смысле врагом человека. Дискретные поисковые запросы не заменят полноценного общения с книгой.

Великие книги — это наше прошлое, настоящее и будущее\! Литература, стоящая над временем, — путеводитель, помогающий личности искать себя в нашем непростом мире. <span class="ob-html-comment" id="comment-275107f9-fed0-44f4-9988-ba5bb445a885" data-tags="[]"><span class="ob-html-comment-body">Inline test1</span>И чем глубже мы их познаем</span>, тем более укрепляются в памяти человечества Аристотель, Платон, Сенека. Как писал Локк, хоть мы и из породы жвачных, недостаточно набить себя множеством книг, ибо они не принесут нам пользы и силы, если тщательно не пережуем и хорошенько не переварим их. Но как? Как сделать чтение по-настоящему глубоким? Как высвободить, подобно тому, о чем писал И. А. Ильин в книге «Возвращение», всю силу душевных способностей и умений, чтобы найти верную <div class="ob-html-comment" id="comment-4a8e08dd-c697-4546-b6ec-a11a4b01881c" data-tags="[Test,]"><span class="ob-html-comment-body">CommentPlaceholder</span>духовную установку </div>и приобрести дар «художественного ясновидения» для понимания произведения?

Методологию, инструментарий, даже целую науку создали и продолжают разрабатывать отечественные и зарубежные исследователи. Известен огромный вклад в науку о чтении Л. Н. Толстого, М. Н. Куфаева, С. И. Поварнина, Н. А. Рубакина, Н. М. Сикорского и многих других блестящих ученых и писателей. Бесспорно, и труд Мортимера Адлера, основателя Института философских исследований в Сан-Франциско и Центра изучения великих идей в Чикаго, вносит лепту в разработку столь жизненно важного направления в воспитании разума и души.
`;