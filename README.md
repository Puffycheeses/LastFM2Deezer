# LastFM 2 Deezer
This code is really for personal use but if anyone else wants to use this this README should explain all thats needed to know.

## Running
```sh
yarn install
lastFM="YourLastFMApiKey" username="YourLastFMUsername" yarn start
```

## Output
Output is structured under 4 headings.

### Matches
Direct matches to the albums Name & Artist, Outputted as direct URLs for easy copy-pasting into other tools.

### Non Deluxe Matches
Deezer likes to label deluxe albums differently to how LastFM does. To deal with this I just fetch the standard edition.

### Fuzzy Matches
These matches only match the album name. 75% of the time it is wrong. I output metadata for what Deezer has alongside metadata for what you searched for, so it's easy at a glance to see if the URL is for the correct album.

### No Matches
Lists albums that are not available on Deezer or were not found using supplied metadata.
