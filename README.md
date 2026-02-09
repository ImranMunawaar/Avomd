# Mobile React Native POC

## dev set up

### .env

contact other devs

### M1 apple silicon chip

- [install cocoapods with brew](https://stackoverflow.com/a/65334677/7155061)
- in ios folder run `pod install`
- if pod installs correctly, use `yarn ios` or run from xcode

if you get errors below, you probably have wrong `.env.client` 
```
ERROR: SyntaxError: JSON Parse error: Unexpected identifier "undefined"
ERROR: Invariant Violation: "main" has not been registered. This can happen if:
* Metro (the local dev server) is run from the wrong folder. Check if Metro is running, stop it and restart it in the current project.
* A module failed to load due to an error and `AppRegistry.registerComponent` wasn't called.
```

### Javascript

- Node version minimum 16
- latest yarn version
- delete node_modules and yarn.lock

### iOS

- Xcode 13
- latest Cocoapods
- Delete Pods and PodFile.lock

### android

- [open JDK 11](https://jdk.java.net/archive)
- set $JAVA_HOME
  - mac:
    export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-11.0.2.jdk/Contents/Home
# Avomd
