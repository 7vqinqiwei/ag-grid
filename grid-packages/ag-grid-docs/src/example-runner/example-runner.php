<?php
require_once 'example-mappings.php';
require_once 'utils.php';

// helpers in the example render, shared between angular and react
function getStyleTags($styles)
{
    if (empty($styles)) {
        return;
    }

    return join("\n    ", array_map(function($style) { return "<link rel=\"stylesheet\" href=\"$style\">"; }, $styles)) . "\n";
}

function isFrameworkComponent($haystack) {
    // only applies to Vue for now - no need for the others as they don't have a ".js" extension
    $fw_extensions = array('Vue.js');
    foreach ($fw_extensions as $fw_extension) {
        if (endsWith($haystack, $fw_extension)) {
            return true;
        }
    }
    return false;
}

function endsWith($haystack, $needle)
{
    return substr($haystack, -strlen($needle)) === $needle;
}

// helpers in the example render, shared between angular, react & vue
function getNonGeneratedScriptTags($scripts, $skipMain = FALSE, $skipFwComponents = FALSE)
{
    $mainJsScript = null;
    $scriptNames = [];
    $mainJsName = 'main.js';

    foreach ($scripts as $script) {
        if (endsWith($script, $mainJsName)) {
            if (!$skipMain) {
                $mainJsScript = $script;
            }

            continue;
        }

        if ($skipFwComponents) {
            if (isFrameworkComponent($script)) {
                continue;
            }
        }

        $scriptNames[] = $script;
    }

    if (isset($mainJsScript)) {
        $scriptNames[] = $mainJsScript;
    }

    if (empty($scriptNames)) {
        return;
    }

    return join("\n    ", array_map(function($script) { return "<script src=\"$script\"></script>"; }, $scriptNames)) . "\n";
}

function moveVanillaFirst($a, $b)
{
    if ($a == "vanilla") {
        return -1;
    } elseif ($b == "vanilla") {
        return 1;
    } else {
        return strcmp($a, $b);
    }
}

function getTypes($dir)
{
    $types = array();
    $files = scandir($dir);
    foreach ($files as $file) {
        if (substr($file, 0, 1) == ".") {
            continue;
        }
        if (is_dir(realpath($dir . "/" . $file))) {
            $types[] = $file;
        }
    }

    usort($types, 'moveVanillaFirst');

    return $types;
}

function get_common_properties($type, $dir, $title, $options, $includeFunctionalReact = true)
{
    $multi = $type === 'multi';
    $generated = $type === 'generated' || $type === 'mixed';

    if ($generated) {
        $types = ['vanilla', 'angular', 'react'];

        if ($includeFunctionalReact && $options['reactFunctional'] !== false) {
            $types[]= 'reactFunctional';
        }

        $types[]= 'vue';
    } else if ($multi) {
        $types = getTypes($dir);
    } else {
        $types = [$type];
    }

    // the dir name of this example (ie javascript-grid-master-detail)
    $section = basename(dirname($_SERVER['SCRIPT_NAME']));

    $query = array(
        "section" => $section,
        "example" => $dir
    );

    if ($multi) {
        $query['multi'] = 1;
    }

    if ($generated) {
        $query['generated'] = 1;
    }

    $config = array(
        'type' => $type,
        'name' => $dir,
        'section' => $section,
        'types' => array(),
        'title' => $title,
        'sourcePrefix' => RUNNER_SOURCE_PREFIX,
        'options' => $options
    );

    return array(
        "multi" => $type === 'multi',
        "generated" => $type === 'generated' || $type === 'mixed',
        "types" => $types,
        "query" => $query,
        "config" => $config
    );
}

function get_current_import_type($exampleType) {
    if($exampleType === 'chart') {
        // standalone charts only supports packages for now
        return 'packages';
    }
    return isset($_COOKIE["agGridRunnerImportType"]) ? $_COOKIE["agGridRunnerImportType"] : 'modules';
}

function get_file_information_for_types($exampleType, $types, $dir, $multi, $generated, $queryString)
{
    $importType = get_current_import_type($exampleType);
    $typeConfig = array();

    foreach ($types as $theType) {
        $entry = array();
        if ($multi) {
            $entry['files'] = getDirContents(path_combine($dir, $theType));
        } else if ($generated) {
            $entry['files'] = getDirContents(path_combine($dir, "_gen", $importType, $theType));
        } else {
            $entry['files'] = getDirContents($dir);
        }

        if ($theType !== 'vanilla' && $theType !== 'as-is') {
            $entry['boilerplatePath'] = "../example-runner/$exampleType-$theType-boilerplate";
            $entry['boilerplateFiles'] = getDirContents($entry['boilerplatePath']);
        }

        $entry['resultUrl'] = "../example-runner/$exampleType-$theType.php?$queryString";

        $typeConfig[$theType] = $entry;
    }

    return $typeConfig;
}

function grid_example($title, $dir, $type = 'vanilla', $options = array())
{
    // $type can be: angular | vanilla | react | vue | multi | as-is | generated

    $common_properties = get_common_properties($type, $dir, $title, $options);
    $multi = $common_properties['multi'];
    $generated = $common_properties['generated'];
    $types = $common_properties['types'];
    $query = $common_properties['query'];

    if ($options['extras']) {
        foreach ($options['extras'] as $extra) {
            $query[$extra] = '1';
        }
    }

    if ($options['modules']) {
        foreach ($options['modules'] as $module) {
            $query[$module] = '1';
        }
    }

    if ($options['enterprise']) {
        $query['enterprise'] = true;
    }

    if ($options['noStyle']) {
        $query['noStyle'] = true;
    }

    if ($options['usePath']) {
        $query['usePath'] = $options['usePath'];
    }

    $gridSettings = array(
        'noStyle' => $options['noStyle'] ? $options['noStyle'] : 0,
        'height' => '100%',
        'width' => '100%',
        'enterprise' => $options['enterprise']
    );

    if (isset($options['grid'])) {
        $gridSettings = array_merge($gridSettings, $options['grid']);
    }

    $config = $common_properties['config'];
    $config['options']['grid'] = $gridSettings;

    if (isset($options['showImportsDropdown'])) {
        $config['showImportsDropdown'] = $options['showImportsDropdown'];
    }

    if (isset($options['removeTitles'])) {
        $config['removeTitles'] = $options['removeTitles'];
    }

    if ($options['defaultImportType']) {
        $config['defaultImportType'] = $options['defaultImportType'];
    }

    $query['grid'] = json_encode($gridSettings);
    $queryString = join("&", array_map('toQueryString', array_keys($query), $query));

    // sets example file & boilerplate information per type (angular, vue etc)
    $config['types'] = get_file_information_for_types('grid', $types, $dir, $multi, $generated, $queryString);

    $jsonConfig = htmlspecialchars(json_encode($config));

    return <<<NG
    <example-runner config="$jsonConfig"></example-runner>
NG;
}

function chart_example($title, $dir, $type = 'vanilla', $options = array())
{
    // $type can be: angular | vanilla | react | vue | multi | as-is | generated

    $common_properties = get_common_properties($type, $dir, $title, $options, false);
    $multi = $common_properties['multi'];
    $generated = $common_properties['generated'];
    $types = $common_properties['types'];
    $query = $common_properties['query'];

    if ($options['extras']) {
        foreach ($options['extras'] as $extra) {
            $query[$extra] = '1';
        }
    }

    $config = $common_properties['config'];

    $config['showImportsDropdown'] = false;
    $config['defaultImportType'] = 'packages';

    $queryString = join("&", array_map('toQueryString', array_keys($query), $query));

    // sets example file & boilerplate information per type (angular, vue etc)
    $config['types'] = get_file_information_for_types('chart', $types, $dir, $multi, $generated, $queryString);

    $jsonConfig = htmlspecialchars(json_encode($config));

    return <<<NG
    <example-runner config="$jsonConfig"></example-runner>
NG;
}

function getStyles($files, $root, $plunkerView)
{
    return filterByExt($files, $root, $plunkerView, 'css');
}

function getScripts($files, $root, $plunkerView)
{
    return filterByExt($files, $root, $plunkerView, 'js');
}

function getDocuments($files, $root, $plunkerView)
{
    return filterByExt($files, $root, $plunkerView, 'html');
}

function getGridSettings()
{
    return json_decode($_GET['grid'], true);
}

function getExampleInfo($exampleType, $boilerplatePrefix)
{
    $importType = get_current_import_type($exampleType);
    $plunkerView = isset($_GET['plunkerView']);
    $multi = isset($_GET['multi']);
    $generated = isset($_GET['generated']);

    $exampleDir = basename($_GET['example']);
    $exampleSection = basename($_GET['section']);

    if ($multi) {
        $appRoot = path_combine('..', $exampleSection, $exampleDir, $boilerplatePrefix);
    } else if ($generated) {
        $appRoot = path_combine('..', $exampleSection, $exampleDir, '_gen', $importType, $boilerplatePrefix);
    } else {
        $appRoot = path_combine('..', $exampleSection, $exampleDir);
    }

    $files = getDirContents($appRoot);

    $styles = getStyles($files, $appRoot, $plunkerView);
    $scripts = getScripts($files, $appRoot, $plunkerView);
    $documents = getDocuments($files, $appRoot, $plunkerView);

    if ($plunkerView) {
        $boilerplatePath = "";
        $appLocation = "./";
    } else {
        $boilerplatePath = "$exampleType-$boilerplatePrefix-boilerplate/";
        $appLocation = "$appRoot/";
    }

    return array(
        "sourcePath" => $appRoot,
        "boilerplatePath" => $boilerplatePath,
        "appLocation" => $appLocation,
        "agGridScriptPath" => AG_GRID_SCRIPT_PATH,
        "styles" => $styles,
        "scripts" => $scripts,
        "documents" => $documents,
        "gridSettings" => getGridSettings()
    );
}

function getReactAppInfo()
{
    $exampleDir = basename($_GET['example']);
    $exampleSection = basename($_GET['section']);

    $appRoot = path_combine('..', $exampleSection, $exampleDir);

    $files = getDirContents($appRoot);

    $styles = getStyles($files, $appRoot, false);
    $scripts = getScripts($files, $appRoot, false);
    $documents = getDocuments($files, $appRoot, false);

    $boilerplatePath = "app-boilerplate/";
    $appLocation = "$appRoot/";

    return array(
        "boilerplatePath" => $boilerplatePath,
        "appLocation" => $appLocation,
        "styles" => $styles,
        "scripts" => $scripts,
        "documents" => $documents
    );
}

function renderExampleExtras($config)
{
    if ($config['bootstrap'] || $config['jqueryui']) {
        // bootstrap and jQuery UI require jQuery
        $config['jquery'] = 1;
    }

    $extras = array(
        'xlsx' => array(
            'scripts' => array(
                'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.10.3/xlsx.core.min.js'
            )
        ),
        'jquery' => array(
            'scripts' => array('https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.1/jquery.min.js')
        ),
        'jqueryui' => array(
            'scripts' => array('https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js'),
            'styles' => array('https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css')
        ),
        'rxjs' => array(
            'scripts' => array('https://cdnjs.cloudflare.com/ajax/libs/rxjs/5.4.0/Rx.min.js')
        ),
        'bluebirdjs' => array(
            'scripts' => array(
                'https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.7.2/bluebird.core.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.7.2/bluebird.min.js'
            )
        ),
        'lodash' => array(
            'scripts' => array('https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js')
        ),
        'momentjs' => array(
            'scripts' => array('https://momentjs.com/downloads/moment-with-locales.min.js')
        ),
        'alasql' => array(
            'scripts' => array('https://cdnjs.cloudflare.com/ajax/libs/alasql/0.5.5/alasql.min.js')
        ),
        'd3' => array(
            'scripts' => array('https://d3js.org/d3.v4.min.js')
        ),
        'sparkline' => array(
            'scripts' => array('https://cdnjs.cloudflare.com/ajax/libs/jquery-sparklines/2.1.2/jquery.sparkline.min.js')
        ),
        'bootstrap' => array(
            'scripts' => array('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js'),
            'styles' => array(
                'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css',
                'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap-theme.min.css'
            )
        ),
        'flatpickr' => array(
            'scripts' => array('https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.2/flatpickr.min.js'),
            'styles' => array(
                'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.2/flatpickr.min.css',
                'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.2/themes/material_blue.css'
            )
        ),
        'roboto' => array(
            'styles' => array(
                'https://fonts.googleapis.com/css?family=Roboto'
            )
        ),
        'fontawesome' => array(
            'styles' => array('https://use.fontawesome.com/releases/v5.6.3/css/all.css')
        ),
        'xlsx-style' => array(
            'scripts' => array('https://unpkg.com/xlsx-style@0.8.13/dist/xlsx.full.min.js')
        ),
        'angularjs1' => array(
            'scripts' => array(
                'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.1/angular.min.js'
            )
        ),
        'ui-bootstrap' => array(
            'scripts' => array(
                '//angular-ui.github.io/bootstrap/ui-bootstrap-tpls-2.5.0.js'
            ),
            'styles' => array(
                '//netdna.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'
            )
        ),
        'materialdesign' => array(
            'styles' => array(
                'https://unpkg.com/@angular/material/prebuilt-themes/indigo-pink.css',
                'https://fonts.googleapis.com/icon?family=Material+Icons'
            )
        ),
        'ngx-bootstrap' => array(
            'styles' => array(
                'https://unpkg.com/bootstrap/dist/css/bootstrap.min.css'
            )
        )
    );

    foreach ($extras as $lib => $resources) {
        if (isset($config[$lib])) {
            if (isset($resources['styles'])) {
                foreach ($resources['styles'] as $style) {
                    echo "    ";
                    echo '<link rel="stylesheet" href="' . $style . '"/>';
                    echo "\n";
                }
            }

            if (isset($resources['scripts'])) {
                foreach ($resources['scripts'] as $script) {
                    echo "\t";
                    echo '<script src="' . $script . '"></script>';
                    echo "\n";
                }
            }
        }
    }
}

?>
