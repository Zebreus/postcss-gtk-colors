// Simple Arithmetics Grammar
// ==========================
//
// Accepts expressions like "2 * (3 + 4)" and computes their value.

Color
  = "#" [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] ([0-9a-fA-F])? ([0-9a-fA-F][0-9a-fA-F])? ([0-9a-fA-F][0-9a-fA-F])? {
      const value = text().slice(1)
      if (value.length == 3) {
        return {type: "rgb", red: ""+parseInt(value[0] + value[0], 16), green: ""+parseInt(value[1] + value[1], 16), blue: ""+parseInt(value[2] + value[2], 16), alpha: "1"}
      } else if (value.length == 4) {
        return {type: "rgb", red: ""+parseInt(value[0] + value[0], 16), green: ""+parseInt(value[1] + value[1], 16), blue: ""+parseInt(value[2] + value[2], 16), alpha: ""+(parseInt(value[3] + value[3], 16)/255)}
      }if (value.length == 6) {
        return {type: "rgb", red: ""+parseInt(value[0] + value[1], 16), green: ""+parseInt(value[2] + value[3], 16), blue: ""+parseInt(value[4] + value[5], 16), alpha: "1"}
      } else if (value.length == 8) {
        return {type: "rgb", red: ""+parseInt(value[0] + value[1], 16), green: ""+parseInt(value[2] + value[3], 16), blue: ""+parseInt(value[4] + value[5], 16), alpha: ""+(parseInt(value[6] + value[7], 16)/255)}
      }
      throw new Error("Unexpected hex color parsing error")
    }
  / "rgb(" _ red:Value Seperator green:Value Seperator blue:Value _ ")" { return {type: "rgb", red, green, blue, alpha: "1" } }
  / "rgba(" _ red:Value Seperator green:Value Seperator blue:Value Seperator alpha:Value _ ")"  { return {type: "rgb", red, green, blue, alpha } }
  / "hsl(" _ hue:Value  Seperator saturation:Value Seperator lightness:Value _ ")" { return {type: "hsl", hue, saturation, lightness, alpha: "1" } }
  / "hsla(" _ hue:Value Seperator saturation:Value Seperator lightness:Value ( ( _ "/" _ ) / Seperator ) alpha:Value _ ")"  { return {type: "hsl", hue, saturation, lightness, alpha } }
  / Mix
  / Shade
  / Alpha
  / Lighter
  / Darker
  / DefinedColor
  / SpecialColor
  / NamedColor

Root
  = content:RootTemplateContent {
    return {type: "root", text: text(), colors: content.colors}
    }

TextColor
  = color:Color { return {color: color, text: text()}}

RootTemplateContentSeparator
  = . tc:RootTemplateContent {return {colors: tc.colors, value: text()}}
  / []* {return {colors: {}, value: text()}}

RootTemplateContent
  = !([ \t\n\r]) color:TextColor tc:RootTemplateContentSeparator {return {colors: {...tc.colors, [color.text]: color.color}, text: text()}}
  / RootTemplateContentSeparator

Seperator
  = _ "," _
  / [ \t\n\r] _

Mix
  = "mix(" _ a:Color _ "," _ b:Color _ "," _ factor:Value _ ")" {
      return {type: "mix", a, b, factor}
    }

Shade
  = "shade(" _ color:Color _ "," _ factor:Value _ ")" {
      return {type: "shade", color, factor}
    }

Alpha
  = "alpha(" _ color:Color _ "," _ factor:Value _ ")" {
      return {type: "alpha", color, factor}
    }

Lighter
  = "lighter(" _ color:Color _ ")" {
      return {type: "lighter", color}
    }

Darker
  = "darker(" _ color:Color _ ")" {
      return {type: "darker", color}
    }

DefinedColor
  = "@" name:[a-zA-Z0-9_-]* { return {type: "defined", name: name.join("")} }

SpecialColor
  = "currentcolor" { return {type: "current" } }
  / "currentColor" { return {type: "current" } }
  / "inherit" { return {type: "inherit" } }



AnythingWithBalancedBrackets
  = [^()]+ AnythingWithBalancedBrackets?
  / "(" AnythingWithBalancedBrackets? ")" AnythingWithBalancedBrackets?

Value "value"
  = "(" AnythingWithBalancedBrackets? ")" Value? { return text() }
  / [^(), \t\n\r]+ Value? { return text() }

_ "whitespace"
  = [ \t\n\r]*

NamedColor "color name"
  = ( "aliceblue"i
  / "antiquewhite"i
  / "aqua"i
  / "aquamarine"i
  / "azure"i
  / "beige"i
  / "bisque"i
  / "black"i
  / "blanchedalmond"i
  / "blue"i
  / "blueviolet"i
  / "brown"i
  / "burlywood"i
  / "cadetblue"i
  / "chartreuse"i
  / "chocolate"i
  / "coral"i
  / "cornflowerblue"i
  / "cornsilk"i
  / "crimson"i
  / "cyan"i
  / "darkblue"i
  / "darkcyan"i
  / "darkgoldenrod"i
  / "darkgray"i
  / "darkgreen"i
  / "darkgrey"i
  / "darkkhaki"i
  / "darkmagenta"i
  / "darkolivegreen"i
  / "darkorange"i
  / "darkorchid"i
  / "darkred"i
  / "darksalmon"i
  / "darkseagreen"i
  / "darkslateblue"i
  / "darkslategray"i
  / "darkslategrey"i
  / "darkturquoise"i
  / "darkviolet"i
  / "deeppink"i
  / "deepskyblue"i
  / "dimgray"i
  / "dimgrey"i
  / "dodgerblue"i
  / "firebrick"i
  / "floralwhite"i
  / "forestgreen"i
  / "fuchsia"i
  / "gainsboro"i
  / "ghostwhite"i
  / "gold"i
  / "goldenrod"i
  / "gray"i
  / "green"i
  / "greenyellow"i
  / "grey"i
  / "honeydew"i
  / "hotpink"i
  / "indianred"i
  / "indigo"i
  / "ivory"i
  / "khaki"i
  / "lavender"i
  / "lavenderblush"i
  / "lawngreen"i
  / "lemonchiffon"i
  / "lightblue"i
  / "lightcoral"i
  / "lightcyan"i
  / "lightgoldenrodyellow"i
  / "lightgray"i
  / "lightgreen"i
  / "lightgrey"i
  / "lightpink"i
  / "lightsalmon"i
  / "lightseagreen"i
  / "lightskyblue"i
  / "lightslategray"i
  / "lightslategrey"i
  / "lightsteelblue"i
  / "lightyellow"i
  / "lime"i
  / "limegreen"i
  / "linen"i
  / "magenta"i
  / "maroon"i
  / "mediumaquamarine"i
  / "mediumblue"i
  / "mediumorchid"i
  / "mediumpurple"i
  / "mediumseagreen"i
  / "mediumslateblue"i
  / "mediumspringgreen"i
  / "mediumturquoise"i
  / "mediumvioletred"i
  / "midnightblue"i
  / "mintcream"i
  / "mistyrose"i
  / "moccasin"i
  / "navajowhite"i
  / "navy"i
  / "oldlace"i
  / "olive"i
  / "olivedrab"i
  / "orange"i
  / "orangered"i
  / "orchid"i
  / "palegoldenrod"i
  / "palegreen"i
  / "paleturquoise"i
  / "palevioletred"i
  / "papayawhip"i
  / "peachpuff"i
  / "peru"i
  / "pink"i
  / "plum"i
  / "powderblue"i
  / "purple"i
  / "red"i
  / "rosybrown"i
  / "royalblue"i
  / "saddlebrown"i
  / "salmon"i
  / "sandybrown"i
  / "seagreen"i
  / "seashell"i
  / "sienna"i
  / "silver"i
  / "skyblue"i
  / "slateblue"i
  / "slategray"i
  / "slategrey"i
  / "snow"i
  / "springgreen"i
  / "steelblue"i
  / "tan"i
  / "teal"i
  / "thistle"i
  / "tomato"i
  / "turquoise"i
  / "violet"i
  / "wheat"i
  / "white"i
  / "whitesmoke"i
  / "yellow"i
  / "yellowgreen"i
  / "transparent"i ) { return {type: "named", name: text()} }