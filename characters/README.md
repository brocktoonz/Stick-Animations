# Character references

One folder per recurring character. Each has a PNG of the character in every
emotion plus `sheet.png` with all of them on one page:

| Folder | Character | Code |
|---|---|---|
| `main/` | the main character (spiky hair) | `Hero.main` |
| `speed/` | IShowSpeed | `Cameos.speed` |
| `ludwig/` | Ludwig | `Cameos.ludwig` |
| `beast/` | MrBeast | `Cameos.beast` |
| `nick/` | Nick | `Cameos.nick` |
| `slime/` | Slime | `Cameos.slime` |

These are renders of the code, not separate drawings, so they always match
what a skit draws. Use an emotion in a skit by name:

    Hero.main(ctx, { x, y, s, ...Emotions.shocked })

The emotions are defined once in `web/emotions.js`: neutral, happy, laughing,
excited, sad, angry, yelling, scared, shocked, nervous, confused (shrug), thinking,
smirk, unimpressed, sleepy. After changing an emotion or a character, re-render
the folders:

    python3 scripts/emotion_sheets.py            # everyone
    python3 scripts/emotion_sheets.py main       # one character

To add a character, add it to `CAST` in `web/skits/emotions.js` and
`scripts/emotion_sheets.py`.
