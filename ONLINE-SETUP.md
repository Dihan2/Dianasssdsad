# 🌐 Как включить онлайн-рекорды (общие для всех)

Сейчас таблица рекордов в ресторане «Чорноморка» работает **локально** — сохраняется на устройстве.
Чтобы рекорды стали **общими для всех игроков**, нужен бесплатный бэкенд. Проще всего — **Supabase** (без карты, 5 минут).

## Шаг 1. Создай проект
1. Зайди на https://supabase.com → **Start your project** → войди через GitHub.
2. **New project**: имя любое (напр. `chornomorka`), придумай пароль к БД, регион — ближе к тебе. Создать.
3. Подожди ~1 минуту, пока проект поднимется.

## Шаг 2. Создай таблицу рекордов
1. Слева **SQL Editor** → **New query**, вставь и нажми **Run**:

```sql
create table scores (
  id bigint generated always as identity primary key,
  name text not null,
  score int not null,
  created_at timestamptz default now()
);

-- разрешаем всем читать и добавлять рекорды (публичный лидерборд)
alter table scores enable row level security;

create policy "read for all"   on scores for select using (true);
create policy "insert for all" on scores for insert with check (true);
```

## Шаг 3. Возьми ключи
1. Слева **Project Settings** (шестерёнка) → **API**.
2. Скопируй:
   - **Project URL** — вида `https://abcdxyz.supabase.co`
   - **anon public** ключ (длинная строка) — он публичный, его безопасно класть в код игры.

## Шаг 4. Впиши в игру
Открой `chornomorka.html`, найди вверху скрипта блок `const SB = {` и заполни:

```js
const SB = {
  url:  'https://abcdxyz.supabase.co',   // твой Project URL
  key:  'eyJhbGciOi...',                 // твой anon public ключ
  table:'scores',
};
```

Сохрани, залей на GitHub — и рекорды станут общими 🎉

> 💡 Проще всего: пришли мне эти два значения (**URL** и **anon-ключ**) — я впишу их и запушу сам.
> anon-ключ публичный и не даёт доступа к данным сверх правил выше, так что делиться им безопасно.

## Необязательно: защита от накрутки
Публичная вставка позволяет любому отправить любой счёт. Для детской игры это ок.
Если захочешь — позже добавим ограничение (Edge Function или простая проверка), скажи.
