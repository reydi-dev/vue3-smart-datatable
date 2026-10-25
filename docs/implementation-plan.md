# برنامه مستقل ساخت vue3-smart-datatable

تاریخ تهیه: ۲۵ اکتبر ۲۰۲۶. این سند برای شروع یک چت تازه در یک پروژه تازه است؛ فرض نکن هیچ پوشه، مخزن، پکیج یا زیرساختی از قبل وجود دارد.

## ۱. مأموریت و زمینه کامل برای چت جدید

یک کتابخانه جدول برای Vue 3 بساز که از تجربه و ظاهر پروژه Vue 2 زیر استفاده کند، اما ساختار داخلی تمیز، API متناسب با Vue 3 و امکان نگهداری مستقل داشته باشد. این درخواست در این مرحله برنامه است؛ ساخت پروژه باید در چت جدید آغاز شود.

- مالک موردنظر GitHub: `reydi-dev`؛ هویت و مجوز حساب قبل از ایجاد مخزن بررسی شود.
- نام پیشنهادی مخزن و پکیج: `vue3-smart-datatable`. آزادبودن این نام هنوز بررسی نشده؛ آن را قطعی فرض نکن.
- مرجع آنلاین: https://github.com/reydi-dev/vue2-smart-datatable
- مرجع محلی موجود: `/Users/mohammadreza/Desktop/Projects/Github/vue2-smart-datatable`
- مبنای ثابت و تأییدشده: تگ `v0.3.1`، کامیت `3e36971d0bb7b5e0f3fbbffdecadf68c4cd5af12`.
- پکیج مرجع: https://www.npmjs.com/package/vue2-smart-datatable
- دمو: https://reydi-dev.github.io/vue2-smart-datatable/
- مجوز مرجع: MIT، کپی‌رایت Mohammad Reza Dehghani؛ اعلان مجوز کدهای منتقل‌شده حفظ شود.
- نسخه Vue 2 مستقل و فعال می‌ماند. این کار مجوز تغییر آن ریپو، تغییر نام پکیج آن یا حذف فایل‌های آن نیست.

اگر مسیر محلی مرجع در محیط جدید وجود نداشت، از مخزن آنلاین در تگ فوق استفاده کن. برای خواندن نسخه ثابت، checkout فعلی پروژه Vue 2 را تغییر نده؛ از Git برای خواندن فایل‌های تگ یا از یک checkout مرجع جداگانه استفاده کن. وابستگی runtime، npm یا توسعه به مسیر محلی نسخه Vue 2 ایجاد نکن.

در مرجع، این فایل‌ها مهم‌اند:

- `src/components/SmartDataTable.vue`: قرارداد props/events/slots، state، چرخه provider و هماهنگی UI.
- `src/components/SmartTableDesktop.vue` و `SmartTableMobile.vue`: رندرها.
- `src/components/SmartTableCell.vue`: انواع سلول و نمایش امن داده.
- `src/core/*`: ستون‌ها، فیلتر، داده محلی، provider، انتخاب، صفحه‌بندی، پیام‌ها، آیکن‌ها و responsive.
- `src/adapters/exporters/csv.ts` و `src/adapters/persistence/local-storage.ts`.
- `src/types/index.ts`، `src/index.ts`، `src/styles/*`.
- `examples/orders/*`، `docs/examples/*`، `docs/api.md` و `docs/clarity-upgrade.md`.
- `tests/unit/*`، `tests/e2e/*` و `tests/consumer/*`.

مرجع در این نقطه ۱۱۰ تست واحد، ۴ تست distribution و ۱۵ تست مرورگر دارد. این اعداد سابقه‌اند؛ در پروژه جدید هیچ تستی بدون اجرا موفق اعلام نشود و تعداد تست هدف مستقلی نیست.

## ۲. شیوه پیشروی و حدود اختیار

1. هر مرحله زیر یک واحد قابل بررسی است. آن مرحله را اجرا و تست کن، کامیت‌های مرتبط بساز و PR بده؛ نتیجه، محدودیت‌ها و لینک PR را گزارش کن و برای تأیید کاربر متوقف شو.
2. پس از تأیید کاربر، CI و head فعلی PR را دوباره بررسی و خودت مرج کن؛ سپس مرحله بعد را با همان روش پیش ببر. تأیید یک مرحله مجوز اجرای همه مراحل یا انتشار npm نیست.
3. کاربر قرار نیست دستورهای Git و مرج را دستی انجام بدهد؛ فقط نتیجه قابل بررسی را تأیید می‌کند. از سؤال مجدد برای انتخاب‌های فنی عادی و برگشت‌پذیر پرهیز کن.
4. طبق اصلاح کاربر، نام برنچ‌ها توصیفی و با پیشوندهایی مانند `feat/`، `fix/`، `chore/` یا `docs/` باشند؛ کلمهٔ `codex` به هیچ عنوان در نام برنچ استفاده نشود. روی `main` توسعه مستقیم انجام نده. مرج ترجیحاً squash و برنچ کاری پس از مرج حذف شود.
5. استثنای لازم برای مخزن خالی: فقط یک commit اولیه شامل README کوتاه، LICENSE و ignoreهای پایه روی main ایجاد شود تا PR ممکن شود. تمام کد و تنظیمات بعدی از PR وارد شوند. این استثنا به معنی توسعه مستقیم روی main نیست.
6. انتشار npm، ایجاد Release عمومی و انتشار دمو فقط در مراحل مشخص‌شده و پس از تأیید نتیجه همان مرحله انجام شود. هیچ secret در چت، فایل، لاگ یا commit قرار نگیرد.
7. در پایان هر مرحله `docs/progress.md` را با نتیجه واقعی تست‌ها، تصمیم‌ها، مشکلات و مرحله بعد به‌روز کن تا چت قابل ادامه باشد.
8. اگر مانع مربوط به حساب، نام یا مسیر مقصد است، فقط همان اطلاعات ضروری را بخواه؛ کارهای مستقل و قابل انجام را پیش ببر. پوشه موجود را بازنویسی نکن.

## ۳. محدوده نسخه اول

اولین انتشار عمومی آزمایشی `0.1.0-beta.1` و اولین انتشار پایدار `0.1.0` است. مستقل از شماره نسخه Vue 2؛ beta با tag `next` منتشر شود و پس از تأیید، stable روی `latest` قرار بگیرد. شماره‌های دقیق و نبود انتشار قبلی هنگام اجرا دوباره بررسی شوند.

قابلیت‌های لازم:

- داده local و server-side، صفحه‌بندی و تغییر تعداد ردیف، مرتب‌سازی تک‌ستونه و فیلترهای موجود.
- انتخاب ردیف با کلید string/number، انتخاب صفحه و سیاست روشن حفظ انتخاب بین صفحات.
- نمایش desktop و mobile، RTL/LTR، پیام‌های قابل تنظیم و light/dark theme.
- ستون قابل تنظیم، formatter، slot سلول/هدر/toolbar/actions و ردیف‌های قابل تعامل.
- loading، empty، no-results، error، retry و disabled با رفتار مشخص.
- انواع سلول موجود مرجع؛ هر حذف یا تفاوت عمدی باید قبل از پیاده‌سازی در ماتریس قرارداد ثبت و تأیید شود.
- CSV فعلی/همه نتایج با محدودیت روشن export، adapter نگهداری ستون‌ها و حفظ قرارداد backend-neutral.
- TypeScript declarations معتبر، CSS جداگانه، نصب مستقل و دمو قابل استفاده.

موارد خارج از نسخه اول: virtualization، ویرایش داخل سلول، گروه‌بندی/pivot، چندمرتب‌سازی، Excel/PDF، drag-and-drop ستون، افزونه مخصوص هر backend، Nuxt module، پنل مدیریت، Vue 2 compatibility layer، استخراج پکیج مشترک میان دو ریپو، بازطراحی دوباره UI و سایت مستندات بزرگ.

پشتیبانی SSR در نسخه اول محدود به import و render ایمن و hydration پایدار در مثال حداقلی است؛ ادعای پشتیبانی کامل Nuxt فقط پس از تست مستقل آن مجاز است.

## ۴. معماری پیشنهادی و قواعد کیفیت

یک مخزن و یک پکیج کافی است. Vue 3 با Composition API و `<script setup lang="ts">`، TypeScript strict، Vite library mode، Vue به‌صورت peer dependency و external در bundle. UI framework، router، store یا HTTP client اجباری اضافه نکن. نسخه ابزارها و Node از اسناد رسمی و محیط واقعی روز شروع انتخاب و در lockfile تثبیت شود؛ حداقل Vue و TypeScript باید با ماکروها و genericهای واقعاً استفاده‌شده سازگار باشد.

ساختار هدف، قابل تعدیل با شواهد هنگام اجرا:

```text
src/
  index.ts
  types/
  core/                  # توابع خالص، مستقل از Vue و DOM
  composables/           # state واکنشی، چرخه عمر و هماهنگی عملیات
  components/
    SmartDataTable.vue    # اتصال اجزا؛ منطق پردازش داده اینجا انباشته نشود
    ...                  # desktop/mobile/cells/controls
  adapters/
    exporters/
    persistence/
  styles/
playground/              # دموی محصول؛ خارج از خروجی npm
tests/
  unit/
  components/
  e2e/
  consumers/             # نصب واقعی tarball بدون alias به src
docs/
  architecture.md
  api.md
  migration-from-vue2.md
  progress.md
  release-checklist.md
```

- جهت وابستگی: `types ← core ← composables ← components`. adapterها به قراردادها وابسته‌اند؛ core نباید Vue، مرورگر، CSS یا playground را import کند.
- `core/responsive.ts` مرجع را کورکورانه منتقل نکن: بخش observer مرورگر باید در لایه composable/browser باشد، بخش محاسبه threshold می‌تواند خالص بماند.
- منطق state، provider، انتخاب، ستون‌ها، responsive و export را فقط وقتی مسئولیت مستقل دارند جدا کن. به ازای هر computed یک فایل یا یک abstraction عمومی نساز.
- composableها داخلی‌اند مگر API عمومی headless عمداً طراحی، مستند و تست شود؛ عمومی‌کردنشان برای نسخه اول لازم نیست.
- یک منبع حقیقت برای state؛ state تکراری بین کامپوننت و composable یا زنجیره watcherهای اصلاح‌کننده یکدیگر ایجاد نشود.
- debounce، AbortController، listenerها، timerها و export روی unmount پاک‌سازی شوند. import ماژول نباید window/document/localStorage بخواند.
- generic مربوط به Row تا ستون، formatter، slot و event حفظ شود. از `any` گسترده و cast برای خاموش‌کردن خطاها پرهیز کن؛ داده ناشناخته provider را در مرز ورودی validate کن.
- ورودی items/columns/filters والد mutate نشود. داده حساس یا متن مصنوعی به‌جای گزارش واقعی تست وارد مستندات نشود.
- styleها با namespace و CSS custom properties؛ نشت global و font/icon CDN اجباری نداشته باشند.
- کد منتقل‌شده را با منبع و تگ آن ثبت کن؛ فایل‌های موقت انتشار، تاریخچه کارهای قدیمی و fixtureهای Vue 2 به ریپوی جدید منتقل نشوند.

## مرحله ۰ — مشخص‌کردن مقصد و بررسی نام‌ها

کارها:

1. مسیر پوشه جدید را از کاربر/پروژه جدید بگیر؛ آن را با مسیر مرجع Vue 2 اشتباه نگیر. اگر پروژه هنوز workspace ندارد، مسیر دقیق و نوع isolation را طبق جریان تأیید خود محیط مشخص کن.
2. وجود یا نبود پوشه مقصد، ریپوی Git و فایل‌های فعلی را بررسی کن. چیزی را پاک یا overwrite نکن.
3. نام مخزن در حساب GitHub و نام `vue3-smart-datatable` در npm را بررسی کن؛ 404/آزادبودن فعلی تضمین رزرو نام نیست.
4. دسترسی حساب‌ها و امکان ساخت مخزن و نشر آینده را بدون افشای credential بررسی کن.
5. اگر نام گرفته شده بود، دو جایگزین شفاف مانند یک نام scoped پیشنهاد بده و پیش از ایجاد مخزن تصمیم نام را بگیر.
6. نسخه و دسترسی مرجع ثابت را تأیید و یک فهرست کوتاه reuse/adapt/drop تهیه کن.

خروجی: نام و مقصد قطعی، وضعیت حساب‌ها و فهرست وابستگی‌های قابل انتقال. معیار پایان: هیچ ابهامی درباره اینکه کدام پوشه و ریپو قرار است ساخته شود وجود نداشته باشد.

## مرحله ۱ — ایجاد پروژه و مخزن

1. پوشه و Git repository جدید را بساز؛ نام اصلی main، مجوز MIT و ignoreهای Node/build/OS را ایجاد کن.
2. مخزن عمومی GitHub را در حساب تأییدشده ایجاد و origin را تنظیم کن؛ شرح کوتاه انگلیسی درباره Vue 3 table بنویس، homepage ساختگی نگذار.
3. commit اولیه حداقلی را push کن؛ سپس برای ساختار پروژه برنچ `chore/project-foundation` بساز.
4. `README.md` اولیه با وضعیت «در حال توسعه، هنوز منتشر نشده»، `CONTRIBUTING.md`، `SECURITY.md`، `CHANGELOG.md` و `AGENTS.md` مختصر بساز.
5. AGENTS باید معماری لایه‌ها، دستورهای واقعی پروژه، ممنوعیت تغییر ریپوی Vue 2، روال PR و تأیید نشر را بیان کند؛ از دستورهای طولانی و متناقض پرهیز کن.
6. سند برنامه را به `docs/implementation-plan.md` و پیشرفت را به `docs/progress.md` منتقل کن.

خروجی: لینک ریپوی جدید و PR ساختار اولیه. معیار پایان: clone پروژه، هویت ریپو و حدود کار روشن است؛ هیچ ویژگی منتشرنشده در README به‌عنوان آماده معرفی نشده.

## مرحله ۲ — ابزار توسعه، build و CI پایه

1. `package.json` واقعی کتابخانه با `private: true` در دوره ساخت؛ scripts برای dev، lint، format:check، typecheck، test:unit، test:components، test:e2e، build، test:dist و build:demo.
2. Vue 3 stable، plugin رسمی Vue برای Vite، TypeScript، vue-tsc، Vitest، Vue Test Utils سازگار با Vue 3، Playwright، ESLint و Prettier را با نسخه‌های سازگار نصب کن. Vite build جای typecheck مستقل را نمی‌گیرد.
3. Node پشتیبانی‌شده را با engines، فایل نسخه محلی و CI هماهنگ کن؛ صرفاً Node قدیمی مرجع را کپی نکن. اگر محیط کار محدودیت سیستم‌عامل داشت، راهکار تست قابل اجرا ثبت شود.
4. library build و playground build جدا باشند؛ Vue در bundle قرار نگیرد و CSS جدا قابل import باشد.
5. خروجی پیش‌فرض پیشنهادی ESM و type declarations است. CJS فقط با نیاز مصرف‌کننده مشخص اضافه شود؛ انتخاب را در architecture ثبت کن.
6. `exports`، `types`، `files` و `sideEffects` مطابق خروجی واقعی تنظیم شوند. مسیر CSS عمومی روشن باشد. subpath adapter تنها وقتی export مستقل واقعی دارد تعریف شود.
7. CI روی PR شامل install از lockfile، format/lint/typecheck، تست‌های موجود، build و pack dry-run باشد. تست هنوز نوشته‌نشده را با تست placeholder «سبز» جلوه نده.
8. یک کامپوننت آزمایشی بسیار کوچک و playground برای اثبات pipeline کافی است؛ نام آن را با محصول کامل اشتباه نگیر و بعداً حذف کن.

خروجی: PR زیرساخت با CI سبز. معیار پایان: یک clone تمیز با npm ci و build موفق است؛ npm pack محتویات پیش‌بینی‌شده دارد؛ هنوز نشر مجاز نیست.

## مرحله ۳ — قرارداد عمومی و ماتریس برابری رفتار

1. از props/events/slots و انواع مرجع یک جدول تهیه کن: «قرارداد Vue 2 → قرارداد Vue 3 → تفاوت عمدی → تست پذیرش».
2. پیشنهاد API: `v-model` برای کلیدهای انتخاب‌شده؛ `v-model:page`، `v-model:items-per-page`، `v-model:sort`، `v-model:filters` و `v-model:visible-columns` برای stateهای مربوطه. نام prop و event متناظر در TS دقیق تعریف شود.
3. controlled/uncontrolled را برای هر state توضیح بده: مقدار اولیه، نبود prop، تغییر خارجی، reset، ترتیب emit و جلوگیری از loop. آرایه انتخاب خالی با «مدل ارائه نشده» اشتباه نشود.
4. refresh/getState/reset و سایر متدهای ضروری ref را از مرجع فهرست و درباره سطح عمومی آن‌ها تصمیم بگیر؛ فقط موارد پذیرفته‌شده با defineExpose عرضه شوند.
5. قرارداد provider و normalizer، page یک‌مبنا، page-size، sort، filter، row key، selection across pages و تغییر داده/ستون/mode/providerContext را مشخص کن.
6. کنترل row-click را صریح و قابل تست طراحی کن. مهاجرت `$listeners` با `$attrs` بدون تعریف emits می‌تواند رفتار دوبار اجرا یا listener گمشده ایجاد کند؛ قرارداد نهایی را تست کن.
7. aliasهای قدیمی Vuetify و `value/input` Vue 2 را به نسخه تازه تحمیل نکن؛ `mobileBreakpoint` عددی و آیکن SVG با قرارداد مشخص کافی است. تفاوت‌ها در migration guide ثبت شوند.
8. حداقل Vue/TS موردنیاز generic props/slots و ماکروها را مشخص کن. نمونه template و TS واقعی برای مدل‌ها و slotها typecheck شود.

خروجی: PR قرارداد و اسناد معماری با نمونه‌های کوچک compile‌شونده. معیار پایان: API اصلی پیش از انتقال گسترده UI قابل بررسی و تأیید باشد.

## مرحله ۴ — انتقال منطق خالص و adapterها

1. types، normalization ستون/row key، فیلترها، local sorting/paging، selection و provider response validation را از مبنای ثابت انتقال و تطبیق بده.
2. منطق سالم را صرفاً برای متفاوت‌بودن بازنویسی نکن. وابستگی Vue/DOM را از لایه خالص خارج کن.
3. تست‌های رفتاری مرجع را منتقل و برای undefined/null، صفر/false، کلید عددی/رشته‌ای، داده خالی و total نامعتبر اجرا کن.
4. CSV: escaping، فرمول‌های spreadsheet، exportValue و رفتار current/all حفظ و تست شوند. localStorage adapter با محیط بدون window و داده خراب ایمن باشد.
5. API هر adapter به قرارداد عمومی وابسته باشد؛ رفتار browser-only در زمان اجرای تابع مشخص و مستند شود.

خروجی: PR core/adapters. معیار پایان: core بدون نصب یا mount Vue قابل تست باشد و تست‌های واقعی داده و امنیت export سبز شوند.

## مرحله ۵ — state واکنشی و چرخه provider

1. composableهای موردنیاز را براساس مسئولیت بساز: هماهنگی state، data source و در صورت نیاز selection/columns/export/viewport. تعداد فایل‌ها هدف کیفیت نیست.
2. debounce، reset صفحه بعد از فیلتر/sort/page-size و sync تغییرات والد را پیاده کن؛ یک تعامل نباید درخواست تکراری یا emit بی‌پایان بسازد.
3. AbortController و شناسه درخواست برای جلوگیری از نمایش پاسخ قدیمی، حتی اگر provider abort را نادیده بگیرد.
4. تغییر mode/provider/context، autoLoad=false، refresh صریح، retry، unmount و disabled را پوشش بده؛ رفتار دقیق autoLoad و disabled با قرارداد مرحله ۳ هماهنگ باشد.
5. persistence ناهمگام نباید تغییر تازه کاربر یا مدل والد را با داده قدیمی overwrite کند. export همه نتایج نباید state صفحه جاری را تغییر دهد؛ پیشرفت و پایان/خطا روشن باشد.
6. تست‌ها با داده و timer کنترل‌شده برای race condition، cancel، unmount، sync والد و تکرارنشدن load نوشته شوند؛ تست صرفاً snapshot نباشد.

خروجی: PR state/provider همراه fixture ساده. معیار پایان: چرخه داده بدون نیاز به UI کامل قابل اثبات باشد.

## مرحله ۶ — UI اصلی دسکتاپ

1. توکن‌ها و styleهای Clarity فعلی را با namespace منتقل کن. طراحی جدید، font خارجی و UI framework اضافه نکن.
2. SmartDataTable را به‌صورت لایه اتصال props، composableها، slotها و renderer پیاده کن؛ پردازش داده دوباره در template/component انباشته نشود.
3. جدول semantic، هدر/مرتب‌سازی، selection، pagination، toolbar، فیلترها، column dialog، row actions و انواع سلول را کامل کن.
4. slotهای Vue 2 به slots/emits/refs استاندارد Vue 3 تبدیل شوند؛ dynamic component به component reference معتبر وصل شود.
5. نمایش امن متن/URL، disabled، focus، labelهای قابل دسترس، خطا/retry/loading/no-results و جلوگیری از bubbling ناخواسته بررسی شود.

خروجی: PR دسکتاپ با دموی local/server. معیار پایان: مسیرهای اصلی واقعی در مرورگر و تست کامپوننت کار کنند؛ فقط ظاهر ثابت کافی نیست.

## مرحله ۷ — موبایل، RTL، theme و کیفیت تعامل

1. renderer موبایل، summary/details و state مشترک با دسکتاپ را منتقل کن؛ تغییر اندازه نباید selection/filter/page را reset کند.
2. LTR/RTL، light/dark، متن طولانی، مقدار خالی، اعداد و تاریخ‌ها، چندخطی و عرض محدود بررسی شوند.
3. responsive browser observer روی mount فعال و cleanup شود؛ خروجی اولیه SSR و client برای hydration با هم سازگار باشد، تغییر layout بعد از mount مستند شود.
4. dialog با نام قابل دسترس، keyboard focus، Escape و بازگشت focus؛ کنترل sort/selection/pagination با صفحه‌کلید کار کند.
5. E2E برای مسیرهای مهم desktop و mobile، RTL و یک مرورگر دوم در صورت اعلام پشتیبانی اضافه کن. ادعای cross-browser صرفاً با اجرای Chrome مجاز نیست.

خروجی: PR responsive/accessibility و شواهد تصویری واقعی. معیار پایان: UI با همان طراحی مرجع، خوانا و بدون overflow ناخواسته است؛ کاربر آن را بصری تأیید کند.

## مرحله ۸ — پکیج واقعی، TypeScript و SSR حداقلی

1. tarball با npm pack بساز و در یک fixture مصرف‌کننده مستقل Vue 3 نصب کن؛ alias به src، symlink توسعه و workspace resolution نباید خطای پکیج را پنهان کند.
2. import کامپوننت، typeها، CSS و adapterهای عمومی از خود پکیج؛ production build و تعامل اصلی مصرف‌کننده تأیید شود.
3. typecheck مصرف‌کننده برای Row generic، ستون‌ها، formatter، مدل‌ها، payload رویداد و slotها؛ چند نمونه نامعتبر نیز واقعاً باید خطای مورد انتظار بدهند.
4. حداقل نسخه Vue اعلام‌شده و نسخه stable انتخاب‌شده را با همین tarball تست کن؛ اگر پشتیبانی نسخه پایین‌تر اثبات نشد peer range را محدود کن.
5. import و SSR render حداقلی بدون window/document اجرا و یک سناریوی hydration کنترل‌شده بررسی شود؛ storage/export فقط در مسیر مجاز مرورگر اجرا شوند.
6. فهرست فایل‌های بسته، وزن، نبود Vue در bundle، declarationها، CSS، مجوز و عدم وجود secret/fixtures/build دمو تأیید شود. JavaScript/داده mock دمو نباید در entry کتابخانه وارد شود.
7. CI نهایی: validate، browser، packed consumer و build demo؛ deploy فقط از main و پس از موفقیت وابستگی‌ها.

خروجی: PR distribution و CI نهایی. معیار پایان: نصب بسته در یک پروژه جدا بدون تنظیم ویژه کار کند؛ typeها و CSS واقعاً از پکیج resolve شوند.

## مرحله ۹ — مستندات و دموی انتشار

1. README انگلیسی با معرفی دقیق، install، import CSS، مثال کوتاه Vue 3، تصویر desktop/mobile، GIF واقعی و لینک دمو.
2. مثال‌های local، provider async با cancellation، custom cell/action، فارسی/RTL و theme با داده مصنوعی؛ تمام نمونه‌های قابل کپی در CI typecheck شوند.
3. docs API براساس پیاده‌سازی نهایی؛ migration از Vue 2 شامل import، v-model، props/events/slots، expose و حذف aliasهای legacy.
4. تصویر SVG و GIF موجود می‌توانند نقطه شروع باشند، اما تا تأیید UI جدید به‌عنوان capture واقعی Vue 3 معرفی نشوند. تصاویر لینک عمومی مطلق داشته باشند تا در GitHub و npm نمایش داده شوند.
5. صفحات آزمایشگاهی و fixtureها وارد منوی عمومی دمو نشوند. دمو روی GitHub Pages با base مسیر مخزن درست deploy شود.
6. توضیح GitHub، homepage واقعی، topicها، issue/PR template، CONTRIBUTING، SECURITY، changelog و preview ساده تکمیل شوند؛ چرخه بازطراحی تبلیغاتی تازه آغاز نکن.

خروجی: PR مستندات و دمو. معیار پایان: کاربر جدید از install به جدول قابل استفاده برسد؛ تصاویر و لینک‌ها سالم باشند و اسناد ادعای اثبات‌نشده نداشته باشند.

## مرحله ۱۰ — انتشار beta

1. وضعیت مراحل و باگ‌ها را مرور کن. باگ نصب، از دست‌رفتن state، پاسخ قدیمی، نوع خراب، مشکل امنیت داده یا keyboard مانع نشر است؛ polish جزئی مانع beta نیست.
2. private را فقط در PR آماده‌سازی انتشار حذف کن، نسخه `0.1.0-beta.1` و publishConfig مناسب `next`، changelog و release checklist را هماهنگ کن.
3. همه بررسی‌های مرتبط و tarball نهایی را برای همان commit اجرا و قبل از نشر گزارش بده؛ از کاربر تأیید نهایی انتشار بگیر.
4. پس از تأیید و مرج، همان commit را pack/publish کن. از اعتماد کامل به تنظیم tag دستی قبلی پرهیز کن؛ tag انتشار صریح باشد و نتیجه registry بررسی شود.
5. اگر npm نیاز به تأیید حساب/۲FA داشت از جریان امن ابزار استفاده کن؛ secret را وارد چت نکن و برای دورزدن آن اقدام نکن.
6. دسترسی نسخه، dist-tag، نصب مستقل از registry، README شامل تصاویر و نبود مشکل در دمو را بررسی کن. npm ممکن است پردازش تأخیری داشته باشد؛ فرمان موفق publish به‌تنهایی کافی نیست.
7. Git tag و GitHub Release با commit منتشرشده تطبیق داشته باشد؛ status توسعه آزمایشی صریح بماند.

خروجی: beta قابل نصب با دستور واقعی، لینک npm، Release و دمو. معیار پایان: نصب نسخه registry و مهم‌ترین سناریوها تأیید شده باشند.

## مرحله ۱۱ — بازخورد محدود و اولین نسخه پایدار

1. یک دور استفاده واقعی در مصرف‌کننده مستقل و تأیید بصری کاربر؛ بازخورد مسدودکننده را از درخواست قابلیت جدید جدا کن.
2. فقط باگ‌های مهم و ناسازگاری API را در PRهای کوچک اصلاح کن؛ قابلیت‌های خارج از محدوده وارد این مرحله نشوند.
3. محدودیت‌های باقی‌مانده مستند و پذیرفته شوند. برای رسیدن به عدد تست یا امتیاز پوشش، تست نمایشی ننویس.
4. PR انتشار `0.1.0` با changelog و بررسی نهایی تهیه، پس از تأیید مرج و روی `latest` منتشر شود. beta و stable هرگز با نسخه Vue 2 اشتباه نشوند.
5. تأیید مجدد registry، README، install، دمو، tag و Release؛ GitHub topics و معرفی کوتاه جامعه Vue آماده شود.
6. سیاست نگهداری دو ریپو ثبت شود: رفع باگ براساس ریسک و نیاز، بدون الزام همسان‌کردن دائمی شماره نسخه یا کپی خودکار تغییرات.

معیار پایان پروژه نسخه اول: نصب مستقل، local/server، تعامل‌های desktop/mobile، RTL، selection، فیلتر، export، typeها و اسناد طبق ماتریس پذیرفته‌شده کار کنند؛ CI سبز و پکیج و دمو منتشر شده باشند. بعد از این نقطه وارد نگهداری شو؛ perfectionism و توسعه بی‌پایان هدف نیست.

## قالب گزارش هر مرحله

- چه چیزی قابل استفاده شد و چرا؟
- کدام قرارداد/فایل‌های اصلی تغییر کردند؟
- دقیقاً چه بررسی‌هایی اجرا شدند و کدام اجرا نشدند؟
- محدودیت یا تصمیم باز چیست؟
- لینک PR، وضعیت CI و نتیجه موردنیاز برای تأیید کاربر.
- پس از مرج: commit نهایی و مرحله بعد در progress ثبت شود.

## منابع فنی برای بازبینی هنگام اجرا

- Vue TypeScript: https://vuejs.org/guide/typescript/overview.html
- Vue tooling: https://vuejs.org/guide/scaling-up/tooling.html
- Vue component v-model: https://vuejs.org/guide/components/v-model.html
- Vue 2 migration: https://v3-migration.vuejs.org/
- Vite library mode: https://vite.dev/guide/build.html#library-mode

این منابع جهت انتخاب ابزار و قرارداد هستند؛ نسخه dependency و حداقل محیط در زمان اجرای مرحله ۲ دوباره بررسی شوند. این سند رزرو نام پکیج یا ساخت مخزن را انجام نداده است.
