module Main exposing (main)

import Css
import Html exposing (..)


main =
    div [ Css.row, Css.gap_md ]
        [ span [ Css.text_red ] [ text "Hello" ]
        , span [] [ text "world" ]
        ]
