# Audio Gemini

An audio-only [Gemini Protocol](https://en.wikipedia.org/wiki/Gemini_(protocol)) browser for Linux.

# What Does It Sound Like?

The file [gemini.mp3](https://github.com/RickCarlino/gemini-protocol-audio-reader/raw/main/gemini.mp3) has a pre-recorded sample of output from gemini://gemini.circumlunar.space/

# Features

 * Reads text aloud using the `espeak` text-to-speech tool.
 * Plays a unique sound for each type of Gemtext element so that you can follow context changes in the document.
 * Reads the alt text of links, but not the URL.
 * Reads the alt text of preformatted text, but not the content.

# Why?

I have trouble reading large blocks of text. In the past, I've devised [numerous fun tricks](https://rickcarlino.com/2017/developer-news-productivity-hack.html) to convert written works to audio. This is an attempt to create a script for personal use that can read gemini sites as audio rather than text. It might be useful for folks with low vision/no vision/dyslexia, but I am not sure of this and wrote the code with personal use in mind. Reach out to me if you find this genuinely useful or want to discuss new features.

This project took me one weekend to finish at a slow pace. I have incorporated the following Open Source components:

 * [Octave UI Sounds](https://github.com/scopegate/octave/) - Used for UI sounds, such as the click made by headings, list items, etc..
 * [Gemtext NPM package](https://github.com/bctnry/gemtext) - I forked this package because it had extra features that were not needed for my usecase.

# Installation

```
sudo apt-get install sox espeak
git clone https://github.com/RickCarlino/gemini-protocol-audio-reader.git
cd https://github.com/RickCarlino/gemini-protocol-audio-reader.git
npm install
```

# Usage

Assuming you want to visit `gemini://gemini.circumlunar.space/`

```
npx ts-node app.ts gemini://gemini.circumlunar.space/
```

# Configuration

There are a number of ENV vars available to configure the application:

 * `PLAY`: Command used to play audio files. Default is "play -q".
 * `TTS`: Command used for text to speech. Default is "espeak -s 140 -l60".
 * `PAUSE`: Command played between elements. Default is "sleep 0.5".

# Wish List / TODOs

 * Make this an NPM package so people can use it via `npx`
 * Ability to export pages as MP3 to read stuff later.
 * Interactive mode so that the user can follow links / browse.
 * Ability to use Google Cloud TTS instead of `espeak`
 * Ability to use the library in a non-CLI context.

# Comments Welcome

If you find this useful or want to help out, feel free to send me an email or open an issue.
