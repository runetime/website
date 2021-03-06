<?php
namespace App\Utilities;

/**
 * Class Parsedown
 */
final class Parsedown
{
    /**
     * @param $text
     *
     * @return string
     */
    public function text($text)
    {
        # make sure no definitions are set
        $this->Definitions = [];

        # standardize line breaks
        $text = str_replace("\r\n", "\n", $text);
        $text = str_replace("\r", "\n", $text);

        # replace tabs with spaces
        $text = str_replace("\t", '    ', $text);

        # remove surrounding line breaks
        $text = trim($text, "\n");

        # split text into lines
        $lines = explode("\n", $text);

        # iterate through lines to identify blocks
        $markup = $this->lines($lines);

        # trim line breaks
        $markup = trim($markup, "\n");

        return $markup;
    }

    #
    # Setters
    #

    private $breaksEnabled;

    /**
     * @param $breaksEnabled
     *
     * @return $this
     */
    public function setBreaksEnabled($breaksEnabled)
    {
        $this->breaksEnabled = $breaksEnabled;

        return $this;
    }

    private $markupEscaped = true;

    /**
     * @param $markupEscaped
     *
     * @return $this
     */
    public function setMarkupEscaped($markupEscaped)
    {
        $this->markupEscaped = $markupEscaped;

        return $this;
    }

    #
    # Lines
    #

    protected $BlockTypes = [
        '#' => ['Atx'],
        '*' => ['Rule', 'List'],
        '+' => ['List'],
        '-' => ['Setext', 'Table', 'Rule', 'List'],
        '0' => ['List'],
        '1' => ['List'],
        '2' => ['List'],
        '3' => ['List'],
        '4' => ['List'],
        '5' => ['List'],
        '6' => ['List'],
        '7' => ['List'],
        '8' => ['List'],
        '9' => ['List'],
        ':' => ['Table'],
        '<' => ['Comment', 'Markup'],
        '=' => ['Setext'],
        '>' => ['Quote', 'Spoiler'],
        '_' => ['Rule'],
        '`' => ['FencedCode'],
        '|' => ['Table'],
        '~' => ['FencedCode'],
    ];

    # ~

    protected $DefinitionTypes = [
        '[' => ['Reference'],
    ];

    # ~

    protected $unmarkedBlockTypes = [
        'CodeBlock',
    ];

    #
    # Blocks
    #
    /**
     * @param array $lines
     *
     * @return string
     */
    private function lines(array $lines)
    {
        $CurrentBlock = null;

        foreach ($lines as $line) {
            if (chop($line) === '') {
                if (isset($CurrentBlock)) {
                    $CurrentBlock['interrupted'] = true;
                }

                continue;
            }

            $indent = 0;

            while (isset($line[$indent]) and $line[$indent] === ' ') {
                $indent++;
            }

            $text = $indent > 0 ? substr($line, $indent) : $line;

            # ~

            $Line = ['body' => $line, 'indent' => $indent, 'text' => $text];

            # ~

            if (isset($CurrentBlock['incomplete'])) {
                $Block = $this->{'addTo' . $CurrentBlock['type']}($Line, $CurrentBlock);

                if (isset($Block)) {
                    $CurrentBlock = $Block;

                    continue;
                } else {
                    if (method_exists($this, 'complete' . $CurrentBlock['type'])) {
                        $CurrentBlock = $this->{'complete' . $CurrentBlock['type']}($CurrentBlock);
                    }

                    unset($CurrentBlock['incomplete']);
                }
            }

            # ~

            $marker = $text[0];

            if (isset($this->DefinitionTypes[$marker])) {
                foreach ($this->DefinitionTypes[$marker] as $definitionType) {
                    $Definition = $this->{'identify' . $definitionType}($Line, $CurrentBlock);

                    if (isset($Definition)) {
                        $this->Definitions[$definitionType][$Definition['id']] = $Definition['data'];

                        continue 2;
                    }
                }
            }

            # ~

            $blockTypes = $this->unmarkedBlockTypes;

            if (isset($this->BlockTypes[$marker])) {
                foreach ($this->BlockTypes[$marker] as $blockType) {
                    $blockTypes [] = $blockType;
                }
            }

            #
            # ~

            foreach ($blockTypes as $blockType) {
                $Block = $this->{'identify' . $blockType}($Line, $CurrentBlock);

                if (isset($Block)) {
                    $Block['type'] = $blockType;

                    if (!isset($Block['identified'])) {
                        $Elements [] = $CurrentBlock['element'];

                        $Block['identified'] = true;
                    }

                    if (method_exists($this, 'addTo' . $blockType)) {
                        $Block['incomplete'] = true;
                    }

                    $CurrentBlock = $Block;

                    continue 2;
                }
            }

            # ~

            if (isset($CurrentBlock) and !isset($CurrentBlock['type']) and !isset($CurrentBlock['interrupted'])) {
                $CurrentBlock['element']['text'] .= "\n" . $text;
            } else {
                $Elements [] = $CurrentBlock['element'];

                $CurrentBlock = $this->buildParagraph($Line);

                $CurrentBlock['identified'] = true;
            }
        }

        # ~

        if (isset($CurrentBlock['incomplete']) and method_exists($this, 'complete' . $CurrentBlock['type'])) {
            $CurrentBlock = $this->{'complete' . $CurrentBlock['type']}($CurrentBlock);
        }

        # ~

        $Elements [] = $CurrentBlock['element'];

        unset($Elements[0]);

        # ~

        $markup = $this->elements($Elements);

        # ~

        return $markup;
    }

    /**
     * Atx
     *
     * @param $Line
     *
     * @return array|void
     */
    protected function identifyAtx($Line)
    {
        if (isset($Line['text'][1])) {
            $level = 1;

            while (isset($Line['text'][$level]) and $Line['text'][$level] === '#') {
                $level++;
            }

            $text = trim($Line['text'], '# ');

            $Block = [
                'element' => [
                    'name'    => 'h' . min(6, $level),
                    'text'    => $text,
                    'handler' => 'line',
                ],
            ];

            return $Block;
        }

        return;
    }

    /**
     * Code
     *
     * @param $Line
     *
     * @return array|null
     */
    protected function identifyCodeBlock($Line)
    {
        if ($Line['indent'] >= 4) {
            $text = substr($Line['body'], 4);

            $Block = [
                'element' => [
                    'name'    => 'pre',
                    'handler' => 'element',
                    'text'    => [
                        'name' => 'code',
                        'text' => $text,
                    ],
                ],
            ];

            return $Block;
        }

        return;
    }

    /**
     * @param $Line
     * @param $Block
     *
     * @return null
     */
    protected function addToCodeBlock($Line, $Block)
    {
        if ($Line['indent'] >= 4) {
            if (isset($Block['interrupted'])) {
                $Block['element']['text']['text'] .= "\n";

                unset($Block['interrupted']);
            }

            $Block['element']['text']['text'] .= "\n";

            $text = substr($Line['body'], 4);

            $Block['element']['text']['text'] .= $text;

            return $Block;
        }

        return;
    }

    /**
     * @param $Block
     *
     * @return mixed
     */
    protected function completeCodeBlock($Block)
    {
        $text = $Block['element']['text']['text'];

        $text = htmlspecialchars($text, ENT_NOQUOTES, 'UTF-8');

        $Block['element']['text']['text'] = $text;

        return $Block;
    }

    /**
     * Comment
     *
     * @param $Line
     *
     * @return array|void
     */
    protected function identifyComment($Line)
    {
        if ($this->markupEscaped) {
            return;
        }

        if (isset($Line['text'][3]) and $Line['text'][3] === '-' and $Line['text'][2] === '-' and $Line['text'][1] === '!') {
            $Block = [
                'element' => $Line['body'],
            ];

            if (preg_match('/-->$/', $Line['text'])) {
                $Block['closed'] = true;
            }

            return $Block;
        }

        return;
    }

    /**
     * @param       $Line
     * @param array $Block
     *
     * @return array|void
     */
    protected function addToComment($Line, array $Block)
    {
        if (isset($Block['closed'])) {
            return;
        }

        $Block['element'] .= "\n" . $Line['body'];

        if (preg_match('/-->$/', $Line['text'])) {
            $Block['closed'] = true;
        }

        return $Block;
    }

    /**
     * Fenced code
     *
     * @param $Line
     *
     * @return array|null
     */
    protected function identifyFencedCode($Line)
    {
        if (preg_match('/^([' . $Line['text'][0] . ']{3,})[ ]*([\w-]+)?[ ]*$/', $Line['text'], $matches)) {
            $Element = [
                'name' => 'code',
                'text' => '',
            ];

            if (isset($matches[2])) {
                $class = 'language-' . $matches[2];

                $Element['attributes'] = [
                    'class' => $class,
                ];
            }

            $Block = [
                'char'    => $Line['text'][0],
                'element' => [
                    'name'    => 'pre',
                    'handler' => 'element',
                    'text'    => $Element,
                ],
            ];

            return $Block;
        }

        return;
    }

    /**
     * @param $Line
     * @param $Block
     *
     * @return null
     */
    protected function addToFencedCode($Line, $Block)
    {
        if (isset($Block['complete'])) {
            return;
        }

        if (isset($Block['interrupted'])) {
            $Block['element']['text']['text'] .= "\n";

            unset($Block['interrupted']);
        }

        if (preg_match('/^' . $Block['char'] . '{3,}[ ]*$/', $Line['text'])) {
            $Block['element']['text']['text'] = substr($Block['element']['text']['text'], 1);

            $Block['complete'] = true;

            return $Block;
        }

        $Block['element']['text']['text'] .= "\n" . $Line['body'];

        return $Block;
    }

    /**
     * @param $Block
     *
     * @return mixed
     */
    protected function completeFencedCode($Block)
    {
        $text = $Block['element']['text']['text'];

        $text = htmlspecialchars($text, ENT_NOQUOTES, 'UTF-8');

        $Block['element']['text']['text'] = $text;

        return $Block;
    }

    /**
     * List
     *
     * @param $Line
     *
     * @return array|null
     */
    protected function identifyList($Line)
    {
        list($name, $pattern) = $Line['text'][0] <= '-' ? ['ul', '[*+-]'] : ['ol', '[0-9]+[.]'];

        if (preg_match('/^(' . $pattern . '[ ]+)(.*)/', $Line['text'], $matches)) {
            $Block = [
                'indent'  => $Line['indent'],
                'pattern' => $pattern,
                'element' => [
                    'name'    => $name,
                    'handler' => 'elements',
                ],
            ];

            $Block['li'] = [
                'name'    => 'li',
                'handler' => 'li',
                'text'    => [
                    $matches[2],
                ],
            ];

            $Block['element']['text'] [] = &$Block['li'];

            return $Block;
        }

        return;
    }

    /**
     * @param       $Line
     * @param array $Block
     *
     * @return array|null
     */
    protected function addToList($Line, array $Block)
    {
        if ($Block['indent'] === $Line['indent'] and preg_match('/^' . $Block['pattern'] . '[ ]+(.*)/', $Line['text'], $matches)) {
            if (isset($Block['interrupted'])) {
                $Block['li']['text'] [] = '';

                unset($Block['interrupted']);
            }

            unset($Block['li']);

            $Block['li'] = [
                'name'    => 'li',
                'handler' => 'li',
                'text'    => [
                    $matches[1],
                ],
            ];

            $Block['element']['text'] [] = &$Block['li'];

            return $Block;
        }

        if (!isset($Block['interrupted'])) {
            $text = preg_replace('/^[ ]{0,4}/', '', $Line['body']);

            $Block['li']['text'] [] = $text;

            return $Block;
        }

        if ($Line['indent'] > 0) {
            $Block['li']['text'] [] = '';

            $text = preg_replace('/^[ ]{0,4}/', '', $Line['body']);

            $Block['li']['text'] [] = $text;

            unset($Block['interrupted']);

            return $Block;
        }

        return;
    }

    /**
     * Quote
     *
     * @param $Line
     *
     * @return array|null
     */
    protected function identifyQuote($Line)
    {
        if (preg_match('/^>![ ]?(.*)/', $Line['text'], $matches)) {
            $Block = [
                'element' => [
                    'name'    => 'blockquote class=\'spoiler\'',
                    'handler' => 'lines',
                    'text'    => (array) $matches[1],
                ],
            ];

            return $Block;
        }
        if (preg_match('/^>[ ]?(.*)/', $Line['text'], $matches)) {
            $Block = [
                'element' => [
                    'name'    => 'blockquote',
                    'handler' => 'lines',
                    'text'    => (array) $matches[1],
                ],
            ];

            return $Block;
        }

        return;
    }

    /**
     * @param       $Line
     * @param array $Block
     *
     * @return array|null
     */
    protected function addToQuote($Line, array $Block)
    {
        if ($Line['text'][0] === '>' and preg_match('/^>[ ]?(.*)/', $Line['text'], $matches)) {
            if (isset($Block['interrupted'])) {
                $Block['element']['text'] [] = '';

                unset($Block['interrupted']);
            }

            $Block['element']['text'] [] = $matches[1];

            return $Block;
        }

        if (!isset($Block['interrupted'])) {
            $Block['element']['text'] [] = $Line['text'];

            return $Block;
        }

        return;
    }

    /**
     * Rule
     *
     * @param $Line
     *
     * @return array|null
     */
    protected function identifyRule($Line)
    {
        if (preg_match('/^([' . $Line['text'][0] . '])([ ]{0,2}\1){2,}[ ]*$/', $Line['text'])) {
            $Block = [
                'element' => [
                    'name' => 'hr',
                ],
            ];

            return $Block;
        }

        return;
    }

    /**
     * Setext
     *
     * @param       $Line
     * @param array $Block
     *
     * @return array|null
     */
    protected function identifySetext($Line, array $Block = null)
    {
        if (!isset($Block) or isset($Block['type']) or isset($Block['interrupted'])) {
            return;
        }

        if (chop($Line['text'], $Line['text'][0]) === '') {
            $Block['element']['name'] = $Line['text'][0] === '=' ? 'h1' : 'h2';

            return $Block;
        }

        return;
    }

    /**
     * Markup
     *
     * @param $Line
     *
     * @return array|null
     */
    protected function identifyMarkup($Line)
    {
        if ($this->markupEscaped) {
            return;
        }

        if (preg_match('/^<(\w[\w\d]*)(?:[ ][^>]*)?(\/?)[ ]*>/', $Line['text'], $matches)) {
            if (in_array($matches[1], $this->textLevelElements)) {
                return;
            }

            $Block = [
                'element' => $Line['body'],
            ];

            if ($matches[2] or in_array($matches[1], $this->voidElements) or preg_match('/<\/' . $matches[1] . '>[ ]*$/', $Line['text'])) {
                $Block['closed'] = true;
            } else {
                $Block['depth'] = 0;
                $Block['name'] = $matches[1];
            }

            return $Block;
        }

        return;
    }

    /**
     * @param       $Line
     * @param array $Block
     *
     * @return array|void
     */
    protected function addToMarkup($Line, array $Block)
    {
        if (isset($Block['closed'])) {
            return;
        }

        if (preg_match('/<' . $Block['name'] . '([ ][^\/]+)?>/', $Line['text'])) {
            # opening tag

            $Block['depth']++;
        }

        if (stripos($Line['text'], '</' . $Block['name'] . '>') !== false) {
            # closing tag

            if ($Block['depth'] > 0) {
                $Block['depth']--;
            } else {
                $Block['closed'] = true;
            }
        }

        $Block['element'] .= "\n" . $Line['body'];

        return $Block;
    }

    /**
     * Table
     *
     * @param       $Line
     * @param array $Block
     *
     * @return array|null
     */
    protected function identifyTable($Line, array $Block = null)
    {
        if (!isset($Block) or isset($Block['type']) or isset($Block['interrupted'])) {
            return;
        }

        if (strpos($Block['element']['text'], '|') !== false and chop($Line['text'], ' -:|') === '') {
            $alignments = [];

            $divider = $Line['text'];

            $divider = trim($divider);
            $divider = trim($divider, '|');

            $dividerCells = explode('|', $divider);

            foreach ($dividerCells as $dividerCell) {
                $dividerCell = trim($dividerCell);

                if ($dividerCell === '') {
                    continue;
                }

                $alignment = null;

                if ($dividerCell[0] === ':') {
                    $alignment = 'left';
                }

                if (substr($dividerCell, -1) === ':') {
                    $alignment = $alignment === 'left' ? 'center' : 'right';
                }

                $alignments [] = $alignment;
            }

            # ~

            $HeaderElements = [];

            $header = $Block['element']['text'];

            $header = trim($header);
            $header = trim($header, '|');

            $headerCells = explode('|', $header);

            foreach ($headerCells as $index => $headerCell) {
                $headerCell = trim($headerCell);

                $HeaderElement = [
                    'name'    => 'th',
                    'text'    => $headerCell,
                    'handler' => 'line',
                ];

                if (isset($alignments[$index])) {
                    $alignment = $alignments[$index];

                    $HeaderElement['attributes'] = [
                        'align' => $alignment,
                    ];
                }

                $HeaderElements [] = $HeaderElement;
            }

            # ~

            $Block = [
                'alignments' => $alignments,
                'identified' => true,
                'element'    => [
                    'name'    => 'table',
                    'handler' => 'elements',
                ],
            ];

            $Block['element']['text'] [] = [
                'name'    => 'thead',
                'handler' => 'elements',
            ];

            $Block['element']['text'] [] = [
                'name'    => 'tbody',
                'handler' => 'elements',
                'text'    => [],
            ];

            $Block['element']['text'][0]['text'] [] = [
                'name'    => 'tr',
                'handler' => 'elements',
                'text'    => $HeaderElements,
            ];

            return $Block;
        }

        return;
    }

    /**
     * @param       $Line
     * @param array $Block
     *
     * @return array
     */
    protected function addToTable($Line, array $Block)
    {
        if ($Line['text'][0] === '|' or strpos($Line['text'], '|')) {
            $Elements = [];

            $row = $Line['text'];

            $row = trim($row);
            $row = trim($row, '|');

            $cells = explode('|', $row);

            foreach ($cells as $index => $cell) {
                $cell = trim($cell);

                $Element = [
                    'name'    => 'td',
                    'handler' => 'line',
                    'text'    => $cell,
                ];

                if (isset($Block['alignments'][$index])) {
                    $Element['attributes'] = [
                        'align' => $Block['alignments'][$index],
                    ];
                }

                $Elements [] = $Element;
            }

            $Element = [
                'name'    => 'tr',
                'handler' => 'elements',
                'text'    => $Elements,
            ];

            $Block['element']['text'][1]['text'] [] = $Element;

            return $Block;
        }

        return;
    }

    /**
     * Definitions
     *
     * @param $Line
     *
     * @return array|null
     */
    protected function identifyReference($Line)
    {
        if (preg_match('/^\[(.+?)\]:[ ]*<?(\S+?)>?(?:[ ]+["\'(](.+)["\')])?[ ]*$/', $Line['text'], $matches)) {
            $Definition = [
                'id'   => strtolower($matches[1]),
                'data' => [
                    'url' => $matches[2],
                ],
            ];

            if (isset($matches[3])) {
                $Definition['data']['title'] = $matches[3];
            }

            return $Definition;
        }

        return;
    }

    #
    # ~
    #
    /**
     * @param $Line
     *
     * @return array
     */
    protected function buildParagraph($Line)
    {
        $Block = [
            'element' => [
                'name'    => 'p',
                'text'    => $Line['text'],
                'handler' => 'line',
            ],
        ];

        return $Block;
    }

    #
    # ~
    #
    /**
     * @param array $Element
     *
     * @return string
     */
    protected function element(array $Element)
    {
        $markup = '<' . $Element['name'];

        if (isset($Element['attributes'])) {
            foreach ($Element['attributes'] as $name => $value) {
                $markup .= ' ' . $name . '="' . $value . '"';
            }
        }

        if (isset($Element['text'])) {
            $markup .= '>';

            if (isset($Element['handler'])) {
                $markup .= $this->$Element['handler']($Element['text']);
            } else {
                $markup .= $Element['text'];
            }

            $markup .= '</' . $Element['name'] . '>';
        } else {
            $markup .= ' />';
        }

        return $markup;
    }

    /**
     * @param array $Elements
     *
     * @return string
     */
    protected function elements(array $Elements)
    {
        $markup = '';

        foreach ($Elements as $Element) {
            if ($Element === null) {
                continue;
            }

            $markup .= "\n";

            if (is_string($Element)) {
                # because of Markup

                $markup .= $Element;

                continue;
            }

            $markup .= $this->element($Element);
        }

        $markup .= "\n";

        return $markup;
    }

    #
    # Spans
    #

    protected $SpanTypes = [
        '!'  => ['Link'], # ?
        '&'  => ['Ampersand'],
        '*'  => ['Emphasis'],
        '/'  => ['Url'],
        '<'  => ['UrlTag', 'EmailTag', 'Tag', 'LessThan'],
        '['  => ['Link'],
        '_'  => ['Emphasis'],
        '`'  => ['InlineCode'],
        '~'  => ['Strikethrough'],
        '\\' => ['EscapeSequence'],
    ];

    # ~

    protected $spanMarkerList = '*_!&[</`~\\';

    #
    # ~
    #
    /**
     * @param $text
     *
     * @return string
     */
    public function line($text)
    {
        $markup = '';

        $remainder = $text;

        $markerPosition = 0;

        while ($excerpt = strpbrk($remainder, $this->spanMarkerList)) {
            $marker = $excerpt[0];

            $markerPosition += strpos($remainder, $marker);

            $Excerpt = ['text' => $excerpt, 'context' => $text];

            foreach ($this->SpanTypes[$marker] as $spanType) {
                $handler = 'identify' . $spanType;

                $Span = $this->$handler($Excerpt);

                if (!isset($Span)) {
                    continue;
                }

                # The identified span can be ahead of the marker.

                if (isset($Span['position']) and $Span['position'] > $markerPosition) {
                    continue;
                }

                # Spans that start at the position of their marker don't have to set a position.

                if (!isset($Span['position'])) {
                    $Span['position'] = $markerPosition;
                }

                $plainText = substr($text, 0, $Span['position']);

                $markup .= $this->readPlainText($plainText);

                $markup .= isset($Span['markup']) ? $Span['markup'] : $this->element($Span['element']);

                $text = substr($text, $Span['position'] + $Span['extent']);

                $remainder = $text;

                $markerPosition = 0;

                continue 2;
            }

            $remainder = substr($excerpt, 1);

            $markerPosition++;
        }

        $markup .= $this->readPlainText($text);

        return $markup;
    }
    /**
     * ~
     *
     * @param $Excerpt
     *
     * @return array|void
     */
    protected function identifyUrl($Excerpt)
    {
        if (!isset($Excerpt['text'][1]) or $Excerpt['text'][1] !== '/') {
            return;
        }

        if (preg_match('/\bhttps?:[\/]{2}[^\s<]+\b\/*/ui', $Excerpt['context'], $matches, PREG_OFFSET_CAPTURE)) {
            $url = str_replace(['&', '<'], ['&amp;', '&lt;'], $matches[0][0]);

            return [
                'extent'   => strlen($matches[0][0]),
                'position' => $matches[0][1],
                'element'  => [
                    'name'       => 'a',
                    'text'       => $url,
                    'attributes' => [
                        'href' => $url,
                    ],
                ],
            ];
        }

        return;
    }

    /**
     * @param $Excerpt
     *
     * @return array|null
     */
    protected function identifyAmpersand($Excerpt)
    {
        if (!preg_match('/^&#?\w+;/', $Excerpt['text'])) {
            return [
                'markup' => '&amp;',
                'extent' => 1,
            ];
        }

        return;
    }

    /**
     * @param $Excerpt
     *
     * @return array|void
     */
    protected function identifyStrikethrough($Excerpt)
    {
        if (!isset($Excerpt['text'][1])) {
            return;
        }

        if ($Excerpt['text'][1] === '~' and preg_match('/^~~(?=\S)(.+?)(?<=\S)~~/', $Excerpt['text'], $matches)) {
            return [
                'extent'  => strlen($matches[0]),
                'element' => [
                    'name'    => 'del',
                    'text'    => $matches[1],
                    'handler' => 'line',
                ],
            ];
        }

        return;
    }

    /**
     * @param $Excerpt
     *
     * @return array|null
     */
    protected function identifyEscapeSequence($Excerpt)
    {
        if (isset($Excerpt['text'][1]) and in_array($Excerpt['text'][1], $this->specialCharacters)) {
            return [
                'markup' => $Excerpt['text'][1],
                'extent' => 2,
            ];
        }

        return;
    }

    /**
     * @return array
     */
    protected function identifyLessThan()
    {
        return [
            'markup' => '&lt;',
            'extent' => 1,
        ];
    }

    /**
     * @param $Excerpt
     *
     * @return array|null
     */
    protected function identifyUrlTag($Excerpt)
    {
        if (strpos($Excerpt['text'], '>') !== false and preg_match('/^<(https?:[\/]{2}[^\s]+?)>/i', $Excerpt['text'], $matches)) {
            $url = str_replace(['&', '<'], ['&amp;', '&lt;'], $matches[1]);

            return [
                'extent'  => strlen($matches[0]),
                'element' => [
                    'name'       => 'a',
                    'text'       => $url,
                    'attributes' => [
                        'href' => $url,
                    ],
                ],
            ];
        }

        return;
    }

    /**
     * @param $Excerpt
     *
     * @return array|null
     */
    protected function identifyEmailTag($Excerpt)
    {
        if (strpos($Excerpt['text'], '>') !== false and preg_match('/^<(\S+?@\S+?)>/', $Excerpt['text'], $matches)) {
            return [
                'extent'  => strlen($matches[0]),
                'element' => [
                    'name'       => 'a',
                    'text'       => $matches[1],
                    'attributes' => [
                        'href' => 'mailto:' . $matches[1],
                    ],
                ],
            ];
        }

        return;
    }

    /**
     * @param $Excerpt
     *
     * @return array|null
     */
    protected function identifyTag($Excerpt)
    {
        if ($this->markupEscaped) {
            return;
        }

        if (strpos($Excerpt['text'], '>') !== false and preg_match('/^<\/?\w.*?>/', $Excerpt['text'], $matches)) {
            return [
                'markup' => $matches[0],
                'extent' => strlen($matches[0]),
            ];
        }

        return;
    }

    /**
     * @param $Excerpt
     *
     * @return array|null
     */
    protected function identifyInlineCode($Excerpt)
    {
        $marker = $Excerpt['text'][0];

        if (preg_match('/^(' . $marker . '+)[ ]*(.+?)[ ]*(?<!' . $marker . ')\1(?!' . $marker . ')/', $Excerpt['text'], $matches)) {
            $text = $matches[2];
            $text = htmlspecialchars($text, ENT_NOQUOTES, 'UTF-8');

            return [
                'extent'  => strlen($matches[0]),
                'element' => [
                    'name' => 'code',
                    'text' => $text,
                ],
            ];
        }

        return;
    }

    /**
     * @param $Excerpt
     *
     * @return array|null
     */
    protected function identifyLink($Excerpt)
    {
        $extent = $Excerpt['text'][0] === '!' ? 1 : 0;

        if (strpos($Excerpt['text'], ']') and preg_match('/\[((?:[^][]|(?R))*)\]/', $Excerpt['text'], $matches)) {
            $Link = ['text' => $matches[1], 'label' => strtolower($matches[1])];

            $extent += strlen($matches[0]);

            $substring = substr($Excerpt['text'], $extent);

            if (preg_match('/^\s*\[([^][]+)\]/', $substring, $matches)) {
                $Link['label'] = strtolower($matches[1]);

                if (isset($this->Definitions['Reference'][$Link['label']])) {
                    $Link += $this->Definitions['Reference'][$Link['label']];

                    $extent += strlen($matches[0]);
                } else {
                    return;
                }
            } elseif (isset($this->Definitions['Reference'][$Link['label']])) {
                $Link += $this->Definitions['Reference'][$Link['label']];

                if (preg_match('/^[ ]*\[\]/', $substring, $matches)) {
                    $extent += strlen($matches[0]);
                }
            } elseif (preg_match('/^\([ ]*(.*?)(?:[ ]+[\'"](.+?)[\'"])?[ ]*\)/', $substring, $matches)) {
                $Link['url'] = $matches[1];

                if (isset($matches[2])) {
                    $Link['title'] = $matches[2];
                }

                $extent += strlen($matches[0]);
            } else {
                return;
            }
        } else {
            return;
        }

        $url = str_replace(['&', '<'], ['&amp;', '&lt;'], $Link['url']);

        if ($Excerpt['text'][0] === '!') {
            $Element = [
                'name'       => 'img',
                'attributes' => [
                    'alt' => $Link['text'],
                    'src' => $url,
                ],
            ];
        } else {
            $Element = [
                'name'       => 'a',
                'handler'    => 'line',
                'text'       => $Link['text'],
                'attributes' => [
                    'href' => $url,
                ],
            ];
        }

        if (isset($Link['title'])) {
            $Element['attributes']['title'] = $Link['title'];
        }

        return [
            'extent'  => $extent,
            'element' => $Element,
        ];
    }

    /**
     * @param $Excerpt
     *
     * @return array|null
     */
    protected function identifyEmphasis($Excerpt)
    {
        if (!isset($Excerpt['text'][1])) {
            return;
        }

        $marker = $Excerpt['text'][0];

        if ($Excerpt['text'][1] === $marker and preg_match($this->StrongRegex[$marker], $Excerpt['text'], $matches)) {
            $emphasis = 'strong';
        } elseif (preg_match($this->EmRegex[$marker], $Excerpt['text'], $matches)) {
            $emphasis = 'em';
        } else {
            return;
        }

        return [
            'extent'  => strlen($matches[0]),
            'element' => [
                'name'    => $emphasis,
                'handler' => 'line',
                'text'    => $matches[1],
            ],
        ];
    }

    #
    # ~
    /**
     * @param $text
     *
     * @return mixed
     */
    protected function readPlainText($text)
    {
        $breakMarker = $this->breaksEnabled ? "\n" : "  \n";

        $text = str_replace($breakMarker, "<br />\n", $text);

        return $text;
    }

    #
    # ~
    #
    /**
     * @param $lines
     *
     * @return mixed|string
     */
    protected function li($lines)
    {
        $markup = $this->lines($lines);

        $trimmedMarkup = trim($markup);

        if (!in_array('', $lines) and substr($trimmedMarkup, 0, 3) === '<p>') {
            $markup = $trimmedMarkup;
            $markup = substr($markup, 3);

            $position = strpos($markup, '</p>');

            $markup = substr_replace($markup, '', $position, 4);
        }

        return $markup;
    }

    #
    # Multiton
    #
    /**
     * @param string $name
     *
     * @return \App\Utilities\Parsedown
     */
    public static function instance($name = 'default')
    {
        if (isset(self::$instances[$name])) {
            return self::$instances[$name];
        }

        $instance = new self();

        self::$instances[$name] = $instance;

        return $instance;
    }

    private static $instances = [];

    #
    # Deprecated Methods
    #
    /**
     * @param $text
     *
     * @deprecated in favor of "text"
     *
     * @return string
     */
    public function parse($text)
    {
        $markup = $this->text($text);

        return $markup;
    }

    #
    # Fields
    #

    protected $Definitions;

    #
    # Read-only

    protected $specialCharacters = [
        '\\', '`', '*', '_', '{', '}', '[', ']', '(', ')', '>', '#', '+', '-', '.', '!',
    ];

    protected $StrongRegex = [
        '*' => '/^[*]{2}((?:[^*]|[*][^*]*[*])+?)[*]{2}(?![*])/s',
        '_' => '/^__((?:[^_]|_[^_]*_)+?)__(?!_)/us',
    ];

    protected $EmRegex = [
        '*' => '/^[*]((?:[^*]|[*][*][^*]+?[*][*])+?)[*](?![*])/s',
        '_' => '/^_((?:[^_]|__[^_]*__)+?)_(?!_)\b/us',
    ];

    protected $voidElements = [
        'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source',
    ];

    protected $textLevelElements = [
        'a', 'br', 'bdo', 'abbr', 'blink', 'nextid', 'acronym', 'basefont',
        'b', 'em', 'big', 'cite', 'small', 'spacer', 'listing',
        'i', 'rp', 'del', 'code',          'strike', 'marquee',
        'q', 'rt', 'ins', 'font',          'strong',
        's', 'tt', 'sub', 'mark',
        'u', 'xm', 'sup', 'nobr',
                   'var', 'ruby',
                   'wbr', 'span',
                          'time',
    ];
}
