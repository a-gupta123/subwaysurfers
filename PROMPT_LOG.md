help me set up expo on my mac for hw10. check if i have node 22.13 or newer and help me update it if needed. walk me through installing expo go on my iphone and signing into a free expo account.

----

create my expo project for late to class using npx create-expo-app@latest with no template flag. tell me which sdk it picked, help me log into the same expo account i used on my iphone, and start the server so i can scan the qr code and check that the starter app opens. keep the starter code for step 2.

----

give me a new qr code, this one says network error

----

now when i scan it it works

----

open src/app/index.tsx and explain how the starter screen works. how does expo router turn files in src/app/ into screens, what does _layout.tsx do, and how is a View different from a div?

----

show me a simple example of a button and text input and explain what useState does. then show me one line of text i can change to see it update on my iphone. also check for AGENTS.md or .claude/settings.json and tell me what i should know before step 4.

----

my expo sdk 58 starter app was working on my iphone through the tunnel, but i don’t see it now. check if the dev server is still running. if needed, restart it with npx expo start --tunnel and give me a fresh qr code. then change the welcome text in src/app/index.tsx to Late to Class so i can verify it updates on my phone. keep the rest of the starter code as is.

----

help me think through what late to class should do before i write my spec. it’s a cmu running game where you swipe between three lanes to dodge obstacles. ask me a few simple questions about how the game should work and what the run history should show so i can write the spec myself.

----

Late to Class
Late to Class is a game where you’re a CMU student trying to get to class. You run across campus, dodge delivery robots and tour groups, and try to beat your high score.
Screens
Play. Tap Start to run. You move forward automatically and can swipe left or right between three lanes. Your score goes up the longer you last, and the obstacles get faster. If you hit something, the game shows your final score and a funny reason you missed class. Tap Play Again to start over.

Run History. See your best score and your last five completed runs, newest first. Your scores stay saved after you close the app.
Acceptance criteria
1. Tapping Start begins a run in the middle lane with a score of 0.
2. Swiping left or right moves you one lane in that direction. Swiping past the edge keeps you in the same lane.
3. While you’re running, your score goes up and obstacles move faster over time.
4. Hitting an obstacle ends the run and shows your final score and a reason you missed class.
5. Tapping Play Again starts a new run with a score of 0.
6. You can open Run History from the Play screen and go back. History shows your best score and up to five completed runs, newest first.
7. After you fully close and reopen the app, Run History still shows the same scores.

here is my spec

put it in a spec.md file in this github repo

https://github.com/a-gupta123/subwaysurfers.git

----

use my final spec for late to class and put it in SPEC.md at the root of my expo project. keep my wording and numbered requirements. commit and push it with the expo starter project to a-gupta123/subwaysurfers, then give me the github link so i can check that both are on the same branch. don’t start building the game yet.

----

move everything inside late-to-class to the root of my github repo on the spec branch. make sure SPEC.md and package.json are both at the root. commit and push it, then send me the github link so i can check. don’t start building the game yet.

----

read SPEC.md and build late to class exactly as described. make both screens, save run history so it stays after i close the app, and make sure it works in expo go on my iphone.

----

start the app through the expo tunnel or reload it if it’s already running so i can test it on my iphone. commit the build as is with the message “Raw agentic build output” before making any fixes.

----

read SPEC.md and check if late to class meets each numbered requirement. look for bugs too. save a numbered list in REVIEW.md, mark each item PASS, FAIL, or WARN, and show me where you found it. don’t fix anything yet.

----

read REVIEW.md and fix the real issues marked FAIL and any serious warnings. explain in the README why i’m leaving any issues from the review alone. keep REVIEW.md as written and commit the fixes as “Fixes after AI review”.

----

polish both screens in late to class so the colors match, the text is easy to read, and the buttons look tappable. give me a quick checklist to test all seven requirements on my iphone, including swiping at the edges and checking that my score is still there after i fully close and reopen expo go. fix anything i find, then commit it as “Polish and final adjustments”.

----

put a seconds after the score to show you are that manhy seconds late to class

also add like 61B and 61A bus. and make the character runner a person. add these elements to the game. and remove robot that doesn't make any sense. Also add scotty

----

give me a new qr code to test again

----

push the propmt log word for word verbatim to the github repo
