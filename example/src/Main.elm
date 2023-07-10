module Main exposing (main)

import Css exposing (..)
import Html exposing (div, span, text)


main =
    div [ row, gap_lg ]
        [ span [] [ text "Hello" ]
        , span [] [ text "world" ]
        ]
