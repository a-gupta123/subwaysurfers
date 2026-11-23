# Late to Class

Late to Class is a mobile game where you run across CMU and dodge delivery robots and tour groups. I wanted to make a game like Subway Surfers but set it on a campus I actually know.

## Screens

### Play

Tap Start and swipe left or right to switch lanes. Your score goes up the longer you last, and the obstacles get faster. When you hit something, you see your final score and why you missed class. Tap Play Again to start a new run.

### Run History

This screen shows your best score and your last five runs, newest first. Your scores are still there when you close and reopen the app.

## How to run it

I tested this on my iPhone with Expo Go. The project uses Expo SDK 58.

Run these commands from the project folder.

```sh
npm install
npx expo start
```

Scan the QR code with your iPhone camera to open the game in Expo Go. If you get a network error, stop the server, run `npx expo start --tunnel`, and scan the new code. This is what worked on my phone.

## What I changed after the review

I fixed collisions so the run ends as soon as you hit an obstacle and the screen freezes where it happened. I also made Run History wait for the latest score to finish saving.

If the app can't read the saved history, it shows an error and keeps the original data. I left it this way because resetting the history would erase the old scores. If you close Expo Go while a score is still saving, that last score can be lost.

## What surprised me

I was surprised that I could change one line on my Mac and see it update on my iPhone without reinstalling the app.
