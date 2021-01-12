# Instazad
## Set up
This project uses Native components for both live streaming and Firebase, as a result, it follows the React Native workflow and not the expo workflow, to install dependencies use the following commands:
1. `npm install`
2. `cd ios && pod install`

The project uses Red5Pro for Live streaming and as a result, it requires a couple more steps to make the project work properly.

Note: These steps are always required after every time `pod install` command is used.

1. open `ios/Instazad.xcworkspace` folder in Xcode.
3. Locate the `Pods` project on the left-side menu.
4. Within the `Targets` listing, select R5VideoView
5. Click on `Build Settings`
6. Search for `Framework Search Paths`, and navigate to it.
7. Click on the Value field and add the directory path to the `Frameworks/R5Streaming.framework` file in the root project (either relative or full path). Tip: drag and drop the directory holding the framework into an entry in the modal and Xcode will fill in the relative path.
8. Do the same 7 steps above again for the top level `Instazad` project.

Note: These instructions were taken from [react-native-red5pro](https://github.com/red5pro/react-native-red5pro). In case you have any troubles with setting up the project, please refer to that repo as well.

## Background
This project is a fork of [iamvucms's react-native-instagram-clone repo](https://github.com/iamvucms/react-native-instagram-clone). The project was then modified to suit the team's requirements. The main extra features that were/will be added to the project are:

- Live Streaming
- Auction posts
- Sale posts
- Pre-auctions

Some of the features that were removed from the project since they are not needed:

- Photo tags
- Hashtags
- Photo classifications

Although the react-native-instagram-clone was a great place to start working on the project, many parts of the project are poorly optimized, poorly written or just simply do not work. As a result, please do not be afraid from making big changes to how the app work as long as you have a very good reason to why the old way was causing a lot of trouble.

## Moving Forward
Please refer to the [project's issues board](https://github.com/MountBaqer/Instazad/projects/1) to see the assigned tasks.

To do a task, please make a new branch for that issue. If two or more issues are closely related and can/should be done together, then you can make a one branch for all these issues. Branches should be given a good descriptive name with the issue number coming first, following the format: `<issues numbers>-some-description`

For example if the task was `Reimplement Creator's Images Picker #6` then `6-Creator-image-picker-reimplantation` is a good name for it.

After doing the task in the branch, please make a pull request to master, and request for the pull request to be reviewed. You can only merge the pull request when it is approved.