<?php
/**
 * General Configuration
 *
 * All of your system's general configuration settings go in here. You can see a
 * list of the available settings in vendor/craftcms/cms/src/config/GeneralConfig.php.
 */

return [
    // Global settings
    '*' => [
        'useProjectConfigFile' => getenv("PROJECT_CONFIG") ?? false,
        'enableGql' => false,
        'defaultWeekStartDay' => 1,
        'useEmailAsUsername' => true,
        'enableCsrfProtection' => true,
        'omitScriptNameInUrls' => true,
        'defaultCpLanguage' => 'en_GB',
        'securityKey' => getenv('SECURITY_KEY'),
        'elevatedSessionDuration' => 360000,
        'defaultSearchTermOptions' => array(
            'subLeft' => true,
            'subRight' => true,
        ),
        'aliases' => [
            'basePath' => $_SERVER['DOCUMENT_ROOT'],
            'baseUrl' => strtolower((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off' ? 'https://' : 'http://') . $_SERVER['SERVER_NAME']),
        ],
        //  Registration & account settings
        'setPasswordPath' => '_account/_password-set',
        'activateAccountSuccessPath' => [
            'nl' => '/registratie-voltooid',
            'fr' => '/inscription-terminee',
            'en' => 'registration-completed'
        ],
        'setPasswordSuccessPath' => [
            'nl' => '/wachtwoord-ingesteld',
            'fr' => '/mot-de-passe-ensemble',
            'en' => '/password-set'
        ],
    ],

    // Production environment settings
    'production' => [
        'enableTemplateCaching' => true,
        'backupOnUpdate' => true,
        'allowAdminChanges' => getenv('ALLOW_ADMIN_CHANGES'),
    ],
    // Staging environment settings
    'staging' => [
        'testToEmailAddress' => getenv("DEBUG_EMAIL"),
        'enableTemplateCaching' => false,
        'backupOnUpdate' => false,
        'allowAdminChanges' => getenv('ALLOW_ADMIN_CHANGES'),
    ],

    // Dev environment settings
    'dev' => [
        'enableTemplateCaching' => false,
        'backupOnUpdate' => false,
        'devMode' => true,
        'siteUrl' => [
            'nl' => strtolower((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off' ? 'https://' : 'http://') . $_SERVER['SERVER_NAME']) . '/nl',
            'fr' => strtolower((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off' ? 'https://' : 'http://') . $_SERVER['SERVER_NAME']) . '/fr',
            'en' => strtolower((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off' ? 'https://' : 'http://') . $_SERVER['SERVER_NAME']) . '/en'
        ]
    ],
];
