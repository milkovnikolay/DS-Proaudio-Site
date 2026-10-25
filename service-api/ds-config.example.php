<?php
/* Образец настроек приёмника заявок site/api/lead.php.
   На хостинге скопировать в папку private/ на уровень ВЫШЕ папки сайта и назвать ds-config.php:
     /…/ds-proaudio.ru/docs/          ← сюда выгружается содержимое site/
     /…/ds-proaudio.ru/private/ds-config.php
   Сам файл с настоящими ключами в репозиторий не кладём. */
return [
  'mail_to'      => 'info@ds-proaudio.ru',          // куда приходят заявки (можно несколько через запятую)
  'mail_from'    => 'no-reply@ds-proaudio.ru',      // от кого; ящик на домене сайта, иначе письма уйдут в спам
  'allow_origin' => ['https://ds-proaudio.ru'],     // с каких адресов сайта принимать заявки
  // мессенджер: заполнить один из двух
  'max_token'    => '',                             // токен бота MAX для бизнеса
  'max_chat'     => '',                             // id чата менеджеров в MAX
  'tg_token'     => '',                             // токен бота Telegram
  'tg_chat'      => '',                             // id чата менеджеров в Telegram
];
