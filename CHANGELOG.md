## [1.0.61](https://github.com/wessberg/browserslist-generator/compare/v1.0.60...v1.0.61) (2021-09-15)

### Bug Fixes

- removed a console.log that had slipped into the published package ([6a73d26](https://github.com/wessberg/browserslist-generator/commit/6a73d261e369f72728a2762427263de1fb517133))

## [1.0.60](https://github.com/wessberg/browserslist-generator/compare/v1.0.59...v1.0.60) (2021-08-31)

## [1.0.59](https://github.com/wessberg/browserslist-generator/compare/v1.0.58...v1.0.59) (2021-06-02)

### Bug Fixes

- fix regression where iOS Safari can't always be parsed correctly ([35da2f7](https://github.com/wessberg/browserslist-generator/commit/35da2f77306604299c1426e6a19f74bdd086064c))

## [1.0.58](https://github.com/wessberg/browserslist-generator/compare/v1.0.57...v1.0.58) (2021-05-21)

### Features

- **ua:** add support for Samsung Internet through its CrossApp feature ([3018c9b](https://github.com/wessberg/browserslist-generator/commit/3018c9be3e260b339d2d028963e93d9b8986ef8e))
- **ua:** catch iPad on iPhone OS 3 ([cd628fe](https://github.com/wessberg/browserslist-generator/commit/cd628fe5bb8f24e6c7e07569542fca4db0ec4dd3))
- **ua:** catch more bots ([7ec729c](https://github.com/wessberg/browserslist-generator/commit/7ec729c994c9593439bcf3f67874d49caf486899))
- **ua:** detect Instagram browser on iOS as ios_saf ([45c9918](https://github.com/wessberg/browserslist-generator/commit/45c9918fd6b63c10390230df62e8050a546e578b))
- **ua:** treat Nokia WAP browsers as IE 8 as that there are no equivalent browsers in Caniuse ([4aa42be](https://github.com/wessberg/browserslist-generator/commit/4aa42be132418446733aa317bc25d533b3a42706))

## [1.0.57](https://github.com/wessberg/browserslist-generator/compare/v1.0.56...v1.0.57) (2021-05-20)

### Features

- **ua:** fall back to the unknown Caniuse browser less often to catch more bad UAs ([1c1db15](https://github.com/wessberg/browserslist-generator/commit/1c1db155c3fa843cfc556868a895e28b28893907))

## [1.0.56](https://github.com/wessberg/browserslist-generator/compare/v1.0.55...v1.0.56) (2021-05-20)

### Bug Fixes

- **ua:** add handling for WebKit-based browsers that do not support a Safari version and attempt to map back into an equivalent Safari version ([1700ca4](https://github.com/wessberg/browserslist-generator/commit/1700ca4244d68743422a46133e94d3d86b3ab4e8))
- **ua:** detect even more bots ([1bb27f4](https://github.com/wessberg/browserslist-generator/commit/1bb27f4a4ba8dbfa779f582acf7e0bd6fda25320))
- **ua:** detect more bots ([9cd9f80](https://github.com/wessberg/browserslist-generator/commit/9cd9f8097f843fdc18528f0061a51b0132373d07))

### Features

- **ua:** add handling with fallbacks for unparseable user agents ([33ff06a](https://github.com/wessberg/browserslist-generator/commit/33ff06a28c92173bfb5bdbecc5641e6335245169))
- **ua:** add handling with more bots ([75e891a](https://github.com/wessberg/browserslist-generator/commit/75e891a82504efe8dfa2766d3c0811739aca866c))
- **ua:** detect the Facebook browser on iOS more often ([a1dd77a](https://github.com/wessberg/browserslist-generator/commit/a1dd77ab1cb2c8214d90c8f8b188cf0d67ee676b))

## [1.0.55](https://github.com/wessberg/browserslist-generator/compare/v1.0.54...v1.0.55) (2021-05-19)

### Features

- **ua:** fall back to latest known iOS Safari version ([7359201](https://github.com/wessberg/browserslist-generator/commit/73592018ae320435bfe65296b05db1bc6e573603))

## [1.0.54](https://github.com/wessberg/browserslist-generator/compare/v1.0.53...v1.0.54) (2021-05-19)

### Features

- **ua:** add better Pale Moon handling ([74b1d74](https://github.com/wessberg/browserslist-generator/commit/74b1d747c4dbbbefec65b92f94a508532525ea28))

## [1.0.53](https://github.com/wessberg/browserslist-generator/compare/v1.0.52...v1.0.53) (2021-05-19)

### Features

- **ua:** add better support for MIUIBrowser on Android and catch more instances of Googlebot ([3836da3](https://github.com/wessberg/browserslist-generator/commit/3836da352a4bfb6a0fff22ee4b76d84d72db41e3))
- **ua:** add better support for MIUIBrowser on Android and catch more instances of Googlebot ([1c3d1a8](https://github.com/wessberg/browserslist-generator/commit/1c3d1a8d2b528f992e3c7d1b5b4ef69c1ac27a66))
- **ua:** add handling or Sogou Explorer, Chromium on Smart TVs, Dalvik VMs, and others ([52f9af7](https://github.com/wessberg/browserslist-generator/commit/52f9af7afd578d0f96039a069350637a9d134395))

## [1.0.52](https://github.com/wessberg/browserslist-generator/compare/v1.0.51...v1.0.52) (2021-05-19)

### Features

- **ua:** add support for detecing Iceweasel as Firefox ([158eb70](https://github.com/wessberg/browserslist-generator/commit/158eb7029af465357d0e4a645d6f02426e329c97))
- **ua:** add support for detecing Iceweasel as Firefox ([cf57061](https://github.com/wessberg/browserslist-generator/commit/cf5706130ff223eda101676591161b3eb69cbeec))
- **ua:** add support for detecting browsers based on Gecko/Firefox like Iceweasel and IceDragon ([065c696](https://github.com/wessberg/browserslist-generator/commit/065c696572be7de741cde8f564283b4b1cb7cf44))

## [1.0.51](https://github.com/wessberg/browserslist-generator/compare/v1.0.50...v1.0.51) (2021-05-19)

### Bug Fixes

- **ua:** add support for Google AdsBot ([06fd644](https://github.com/wessberg/browserslist-generator/commit/06fd64462056570f3538563a5d224908e4a08934))

## [1.0.50](https://github.com/wessberg/browserslist-generator/compare/v1.0.49...v1.0.50) (2021-05-19)

### Bug Fixes

- **ua:** add detection for more bots ([bbffdbb](https://github.com/wessberg/browserslist-generator/commit/bbffdbb16251c8ff4e0f3c45c1e5bfb5768db543))
- **ua:** handle special case with the old stock Android browser ([2f2847e](https://github.com/wessberg/browserslist-generator/commit/2f2847e0f4dfbca095fe169e286250b277d48728))

## [1.0.49](https://github.com/wessberg/browserslist-generator/compare/v1.0.48...v1.0.49) (2021-05-19)

### Features

- **ua:** fix detection of the Facebook browser on iOS and Edge Mobile on Android ([0a4562d](https://github.com/wessberg/browserslist-generator/commit/0a4562d2fa304fe7f18ed9e7bbe300c296e6b5e5))

## [1.0.48](https://github.com/wessberg/browserslist-generator/compare/v1.0.47...v1.0.48) (2021-05-19)

## [1.0.47](https://github.com/wessberg/browserslist-generator/compare/v1.0.46...v1.0.47) (2021-04-10)

### Bug Fixes

- **edge:** work around UAParser change where EdgeHTML versions weren't being used anymore ([bba685f](https://github.com/wessberg/browserslist-generator/commit/bba685fe4dab525e1743a4c82fd44fa2c227df2b))

## [1.0.46](https://github.com/wessberg/browserslist-generator/compare/v1.0.44...v1.0.46) (2021-03-25)

## [1.0.44](https://github.com/wessberg/browserslist-generator/compare/v1.0.42...v1.0.44) (2021-03-16)

## [1.0.42](https://github.com/wessberg/browserslist-generator/compare/v1.0.41...v1.0.42) (2020-11-06)

## [1.0.41](https://github.com/wessberg/browserslist-generator/compare/v1.0.40...v1.0.41) (2020-10-27)

### Bug Fixes

- fix classList detection on Edge 15 and IE 10 ([a66875b](https://github.com/wessberg/browserslist-generator/commit/a66875bde2c0f49437a7f29433f29bae4679c8ca))

## [1.0.40](https://github.com/wessberg/browserslist-generator/compare/v1.0.39...v1.0.40) (2020-10-21)

## [1.0.39](https://github.com/wessberg/browserslist-generator/compare/v1.0.38...v1.0.39) (2020-10-13)

## [1.0.38](https://github.com/wessberg/browserslist-generator/compare/v1.0.37...v1.0.38) (2020-09-30)

## [1.0.37](https://github.com/wessberg/browserslist-generator/compare/v1.0.36...v1.0.37) (2020-06-22)

### Bug Fixes

- **mdn:** update mdn data structure ([b83d160](https://github.com/wessberg/browserslist-generator/commit/b83d160d36be9774b7c327cbd5f95fc504a367e8))

## [1.0.36](https://github.com/wessberg/browserslist-generator/compare/v1.0.35...v1.0.36) (2020-05-04)

### Bug Fixes

- correctly detect QQ browser and MiuiBrowser. ([04f5f73](https://github.com/wessberg/browserslist-generator/commit/04f5f73bb0c9bbfc63c33d1725860ee07f803461))

## [1.0.35](https://github.com/wessberg/browserslist-generator/compare/v1.0.34...v1.0.35) (2020-03-30)

### Bug Fixes

- **Android on Firefox:** stop treating and_ff as firefox ([fb645f4](https://github.com/wessberg/browserslist-generator/commit/fb645f4b2ec2e71c44076b8c76a63d4018248c76))

## [1.0.34](https://github.com/wessberg/browserslist-generator/compare/v1.0.33...v1.0.34) (2020-03-04)

### Bug Fixes

- add support for FBAN (Facebook in-app browser) on iOS and Android ([0be9eea](https://github.com/wessberg/browserslist-generator/commit/0be9eeaff980c0cca8d9bd39877154174d802c1b))

## [1.0.33](https://github.com/wessberg/browserslist-generator/compare/v1.0.32...v1.0.33) (2020-02-13)

### Bug Fixes

- remove temporary workaround now that an external issue in the Browserslist repository has been fixed ([7573be5](https://github.com/wessberg/browserslist-generator/commit/7573be554d2ec54421bc91e2cd2d53c73d4c305f))

## [1.0.32](https://github.com/wessberg/browserslist-generator/compare/v1.0.31...v1.0.32) (2020-01-29)

### Bug Fixes

- add a workaround for a Browserslist regression ([c8531ab](https://github.com/wessberg/browserslist-generator/commit/c8531abcd94b2a78bcfd5ddea14ce11cbd66fe83))

## [1.0.31](https://github.com/wessberg/browserslist-generator/compare/v1.0.30...v1.0.31) (2020-01-28)

## [1.0.30](https://github.com/wessberg/browserslist-generator/compare/v1.0.29...v1.0.30) (2019-11-09)

### Bug Fixes

- **and_chr:** fix issue with detecting ECMA version support for and_chr. Closes [#3](https://github.com/wessberg/browserslist-generator/issues/3) ([e04fe9b](https://github.com/wessberg/browserslist-generator/commit/e04fe9bd5768b1176d9e5059db0d4f3612bce2c3))

## [1.0.29](https://github.com/wessberg/browserslist-generator/compare/v1.0.28...v1.0.29) (2019-10-15)

## [1.0.28](https://github.com/wessberg/browserslist-generator/compare/v1.0.27...v1.0.28) (2019-10-15)

## [1.0.27](https://github.com/wessberg/browserslist-generator/compare/v1.0.26...v1.0.27) (2019-10-01)

### Bug Fixes

- **bug:** mark Safari as not supporting Web Animations by default ([9c77715](https://github.com/wessberg/browserslist-generator/commit/9c77715252e96f18554460e2e430ba43c07b3501))

## [1.0.26](https://github.com/wessberg/browserslist-generator/compare/v1.0.25...v1.0.26) (2019-09-25)

### Bug Fixes

- **safari:** fix an issue where ResizeObserver is detected as supported by Safari (it is an experimental opt-in feature) ([6492c07](https://github.com/wessberg/browserslist-generator/commit/6492c07fa4a5de52555bed13e34a0aff7041e493))

## [1.0.25](https://github.com/wessberg/browserslist-generator/compare/v1.0.24...v1.0.25) (2019-09-25)

### Bug Fixes

- **safari:** fix an issue where ResizeObserver is detected as supported by Safari (it is an experimental opt-in feature) ([b6d571c](https://github.com/wessberg/browserslist-generator/commit/b6d571c8150b239f36822c96115f64ac845e5d29))

## [1.0.24](https://github.com/wessberg/browserslist-generator/compare/v1.0.23...v1.0.24) (2019-09-09)

### Bug Fixes

- **caniuse:** fix caniuse data that were broken for some time ([f8babd7](https://github.com/wessberg/browserslist-generator/commit/f8babd7fca23be42a158877c329860cc695c3548))

## [1.0.23](https://github.com/wessberg/browserslist-generator/compare/v1.0.22...v1.0.23) (2019-06-20)

### Bug Fixes

- **bug:** rollback on Caniuse version to 4.6.2 which doesn't include a dependency on the bad version of caniuse-lite ([3f61c38](https://github.com/wessberg/browserslist-generator/commit/3f61c387c7aeaa7daaccac0cc04aaa5175199f0d))

## [1.0.22](https://github.com/wessberg/browserslist-generator/compare/v1.0.21...v1.0.22) (2019-06-20)

### Bug Fixes

- **bug:** fixes bug where Android version 'all' could lead to crashes ([009f868](https://github.com/wessberg/browserslist-generator/commit/009f8686a17f91fa78ea35b4b0c841b7b0c51471))
- **bug:** fixes bug where Android version 'all' could lead to crashes ([886569b](https://github.com/wessberg/browserslist-generator/commit/886569b83a8dcaf2135cb8b2ca41abcb7bca0e63))
- **bug:** rollback of update to broken version of caniuse-lite ([f64533a](https://github.com/wessberg/browserslist-generator/commit/f64533a0f3908071c5ae354ef5ea5e956495036e))

## [1.0.21](https://github.com/wessberg/browserslist-generator/compare/v1.0.20...v1.0.21) (2019-05-29)

## [1.0.20](https://github.com/wessberg/browserslist-generator/compare/v1.0.19...v1.0.20) (2019-05-29)

### Features

- **es2020:** adds support for EcmaScript 2020 features and generating a browserslist for it ([b6e598e](https://github.com/wessberg/browserslist-generator/commit/b6e598e8a8ec54b6956bdc34a4aeb502d9d4758b))

## [1.0.19](https://github.com/wessberg/browserslist-generator/compare/v1.0.18...v1.0.19) (2019-05-08)

### Bug Fixes

- **safari 12.1:** fixes issue that would make Safari 12.1 appear as Safari TP ([ed9dbe3](https://github.com/wessberg/browserslist-generator/commit/ed9dbe3efa8b576768bfeda15559a6b1a760cea1))

## [1.0.18](https://github.com/wessberg/browserslist-generator/compare/v1.0.17...v1.0.18) (2019-04-11)

### Features

- **Facebook Crawler:** adds support for detecting The Facebook Crawler (facebookexternalhit) ([3df1142](https://github.com/wessberg/browserslist-generator/commit/3df1142a2ff014c3d7dd4075b51d909662e9f89b))

## [1.0.17](https://github.com/wessberg/browserslist-generator/compare/v1.0.16...v1.0.17) (2019-04-11)

### Features

- **browser support:** adds support for detecting user agents from Chrome WebView ([f5fed56](https://github.com/wessberg/browserslist-generator/commit/f5fed56ceb4c60eb2f1a18d943119dc70d23f8bd))

## [1.0.16](https://github.com/wessberg/browserslist-generator/compare/v1.0.15...v1.0.16) (2019-04-07)

### Bug Fixes

- **api.Window:** adds data corrections for the MDN feature api.Window ([de30bec](https://github.com/wessberg/browserslist-generator/commit/de30becc7078fb742dd310aac26e0ff460cf9cca))

## [1.0.15](https://github.com/wessberg/browserslist-generator/compare/v1.0.14...v1.0.15) (2019-03-30)

### Bug Fixes

- **bug:** fixes an issue with detecting ES2019 features ([2f55451](https://github.com/wessberg/browserslist-generator/commit/2f554510057c845e10799e1684144719bbad1da6))

## [1.0.14](https://github.com/wessberg/browserslist-generator/compare/v1.0.13...v1.0.14) (2019-03-30)

### Features

- **EcmaVersion:** adds support for generating browserslists for browsers with support for ES2019 ([55e3354](https://github.com/wessberg/browserslist-generator/commit/55e335485502b6df6955b7b3bd22789f0df3467d))

## [1.0.13](https://github.com/wessberg/browserslist-generator/compare/v1.0.12...v1.0.13) (2019-03-12)

## [1.0.12](https://github.com/wessberg/browserslist-generator/compare/v1.0.11...v1.0.12) (2019-02-28)

### Bug Fixes

- **browsers:** adds support for parsing SamsungBrowser 8.2 ([a6b3217](https://github.com/wessberg/browserslist-generator/commit/a6b3217ba6da37fa8a83ef2cd6b51c6c916cf922))

## [1.0.11](https://github.com/wessberg/browserslist-generator/compare/v1.0.10...v1.0.11) (2019-02-16)

### Bug Fixes

- **tests:** fixes a test that would crash ([9584632](https://github.com/wessberg/browserslist-generator/commit/9584632d8f923f02a73ea27af78ef43a9ab51574))

## [1.0.10](https://github.com/wessberg/browserslist-generator/compare/v1.0.9...v1.0.10) (2019-02-07)

## [1.0.9](https://github.com/wessberg/browserslist-generator/compare/v1.0.8...v1.0.9) (2019-01-28)

### Bug Fixes

- **edge:** fixes an issue where some minor versions of Edge 16 would report as Edge 18 ([a0623f6](https://github.com/wessberg/browserslist-generator/commit/a0623f6369bd72f07ee49afb6367cf917ce98652))

## [1.0.8](https://github.com/wessberg/browserslist-generator/compare/v1.0.7...v1.0.8) (2019-01-24)

### Bug Fixes

- **build:** updates build scripts ([a047643](https://github.com/wessberg/browserslist-generator/commit/a0476433e5c8702b395e83ad3486d999a596fa17))
- **package.json:** updated prettier configuration ([ea31ab8](https://github.com/wessberg/browserslist-generator/commit/ea31ab86cc35ad8e4155fde75b7af752aa963f4b))
- **project:** ran prettier ([406b371](https://github.com/wessberg/browserslist-generator/commit/406b371d8b61ae14dcb7eeac34f8013b8045c06e))
- **safari:** fixes an issue where patch versions of safari 12 would incorrectly translate to safari TP ([8398d13](https://github.com/wessberg/browserslist-generator/commit/8398d13543f2999afe7d7824e71667f771aa8ecf))

## [1.0.7](https://github.com/wessberg/browserslist-generator/compare/v1.0.6...v1.0.7) (2019-01-24)

### Bug Fixes

- **build:** updates build scripts ([06f8e32](https://github.com/wessberg/browserslist-generator/commit/06f8e32ecf03c6522694823edc99a9973e69bad2))

## [1.0.6](https://github.com/wessberg/browserslist-generator/compare/v1.0.5...v1.0.6) (2019-01-24)

### Bug Fixes

- **bug:** fixes some issues with detecting safari vs safari TP ([25c1b17](https://github.com/wessberg/browserslist-generator/commit/25c1b17ef4535dc048e6b22208ef68d9a6614b72))
- **build:** adds Rollup to the build pipeline to produce simple, flat output ([4218de0](https://github.com/wessberg/browserslist-generator/commit/4218de07be918a2585f751671a313a63a3a8b793))
- **build:** updates build scripts ([dd9f8ab](https://github.com/wessberg/browserslist-generator/commit/dd9f8ab5d952f2b9bd5c53a7810b2e2a2bd7a55d))

## [1.0.5](https://github.com/wessberg/browserslist-generator/compare/v1.0.4...v1.0.5) (2019-01-21)

### Bug Fixes

- **documentation:** fix logo dimensions ([362b71b](https://github.com/wessberg/browserslist-generator/commit/362b71b36ac656e8d35b5ffdf691f0732f691d5f))
- **documentation:** fix logo dimensions ([cf35fea](https://github.com/wessberg/browserslist-generator/commit/cf35feaf97d7cf0a693379f7736318609e8aeef4))

## [1.0.4](https://github.com/wessberg/browserslist-generator/compare/v1.0.3...v1.0.4) (2019-01-21)

### Bug Fixes

- **documentation:** adds a logo ([8fd5091](https://github.com/wessberg/browserslist-generator/commit/8fd50916bf1ec88fec02a933e8785e662b8c5bf6))
- **format:** adds Prettier to the project including commit hooks ([4954096](https://github.com/wessberg/browserslist-generator/commit/4954096804b5d3dc408000cd3172b4b3862c299d))
- **format:** adds Prettier to the project including commit hooks ([5433f98](https://github.com/wessberg/browserslist-generator/commit/5433f9877ab67e386ef67d44ea40f32df618ce38))
- **package.json:** adds files array rather than .npmignore to package.json ([1faeb6d](https://github.com/wessberg/browserslist-generator/commit/1faeb6d6cb30dc74e2ffbfbb1021690db41e6033))

## [1.0.3](https://github.com/wessberg/browserslist-generator/compare/v1.0.2...v1.0.3) (2019-01-11)

## [1.0.2](https://github.com/wessberg/browserslist-generator/compare/v1.0.1...v1.0.2) (2019-01-07)

## [1.0.1](https://github.com/wessberg/browserslist-generator/compare/v1.0.0...v1.0.1) (2019-01-07)

# [1.0.0](https://github.com/wessberg/browserslist-generator/compare/v0.0.57...v1.0.0) (2019-01-07)

## [0.0.57](https://github.com/wessberg/browserslist-generator/compare/v0.0.56...v0.0.57) (2019-01-04)

## [0.0.56](https://github.com/wessberg/browserslist-generator/compare/v0.0.55...v0.0.56) (2018-12-22)

## [0.0.55](https://github.com/wessberg/browserslist-generator/compare/v0.0.54...v0.0.55) (2018-12-22)

## [0.0.54](https://github.com/wessberg/browserslist-generator/compare/v0.0.53...v0.0.54) (2018-12-06)

## [0.0.53](https://github.com/wessberg/browserslist-generator/compare/v0.0.52...v0.0.53) (2018-12-06)

## [0.0.52](https://github.com/wessberg/browserslist-generator/compare/v0.0.51...v0.0.52) (2018-10-31)

## [0.0.51](https://github.com/wessberg/browserslist-generator/compare/v0.0.50...v0.0.51) (2018-10-30)

## [0.0.50](https://github.com/wessberg/browserslist-generator/compare/v0.0.49...v0.0.50) (2018-10-24)

## [0.0.49](https://github.com/wessberg/browserslist-generator/compare/v0.0.48...v0.0.49) (2018-10-24)

## [0.0.48](https://github.com/wessberg/browserslist-generator/compare/v0.0.47...v0.0.48) (2018-10-10)

### Features

- Added a few new functions: 'getAppropriateEcmaVersionForBrowserslist', 'browserslistSupportsEcmaVersion', and 'browsersWithSupportForEcmaVersion' ([8173687](https://github.com/wessberg/browserslist-generator/commit/8173687e1f2422f968f393bd7b760a9387ac8c50))

## [0.0.47](https://github.com/wessberg/browserslist-generator/compare/v0.0.46...v0.0.47) (2018-09-24)

## [0.0.46](https://github.com/wessberg/browserslist-generator/compare/v0.0.45...v0.0.46) (2018-09-24)

## [0.0.45](https://github.com/wessberg/browserslist-generator/compare/v0.0.44...v0.0.45) (2018-09-24)

## [0.0.44](https://github.com/wessberg/browserslist-generator/compare/v0.0.43...v0.0.44) (2018-09-09)

## [0.0.43](https://github.com/wessberg/browserslist-generator/compare/v0.0.42...v0.0.43) (2018-08-30)

## [0.0.42](https://github.com/wessberg/browserslist-generator/compare/v0.0.41...v0.0.42) (2018-08-30)

## [0.0.41](https://github.com/wessberg/browserslist-generator/compare/v0.0.40...v0.0.41) (2018-08-30)

## [0.0.40](https://github.com/wessberg/browserslist-generator/compare/v0.0.39...v0.0.40) (2018-08-30)

## [0.0.39](https://github.com/wessberg/browserslist-generator/compare/v0.0.38...v0.0.39) (2018-08-29)

## [0.0.38](https://github.com/wessberg/browserslist-generator/compare/v0.0.37...v0.0.38) (2018-07-30)

## [0.0.37](https://github.com/wessberg/browserslist-generator/compare/v0.0.36...v0.0.37) (2018-06-15)

## [0.0.36](https://github.com/wessberg/browserslist-generator/compare/v0.0.35...v0.0.36) (2018-06-13)

## [0.0.35](https://github.com/wessberg/browserslist-generator/compare/v0.0.34...v0.0.35) (2018-06-13)

## [0.0.34](https://github.com/wessberg/browserslist-generator/compare/v0.0.33...v0.0.34) (2018-06-13)

## [0.0.33](https://github.com/wessberg/browserslist-generator/compare/v0.0.32...v0.0.33) (2018-06-13)

## [0.0.32](https://github.com/wessberg/browserslist-generator/compare/v0.0.31...v0.0.32) (2018-06-13)

## [0.0.31](https://github.com/wessberg/browserslist-generator/compare/v0.0.30...v0.0.31) (2018-06-12)

## [0.0.30](https://github.com/wessberg/browserslist-generator/compare/v0.0.29...v0.0.30) (2018-06-07)

## [0.0.29](https://github.com/wessberg/browserslist-generator/compare/v0.0.28...v0.0.29) (2018-06-07)

## [0.0.28](https://github.com/wessberg/browserslist-generator/compare/v0.0.27...v0.0.28) (2018-06-07)

## [0.0.27](https://github.com/wessberg/browserslist-generator/compare/v0.0.26...v0.0.27) (2018-05-23)

## [0.0.26](https://github.com/wessberg/browserslist-generator/compare/v0.0.25...v0.0.26) (2018-05-18)

## [0.0.25](https://github.com/wessberg/browserslist-generator/compare/v0.0.24...v0.0.25) (2018-05-08)

## [0.0.24](https://github.com/wessberg/browserslist-generator/compare/v0.0.23...v0.0.24) (2018-05-07)

## [0.0.23](https://github.com/wessberg/browserslist-generator/compare/v0.0.22...v0.0.23) (2018-05-07)

## [0.0.22](https://github.com/wessberg/browserslist-generator/compare/v0.0.21...v0.0.22) (2018-05-07)

## [0.0.21](https://github.com/wessberg/browserslist-generator/compare/v0.0.20...v0.0.21) (2018-05-07)

## [0.0.20](https://github.com/wessberg/browserslist-generator/compare/v0.0.19...v0.0.20) (2018-05-06)

## [0.0.19](https://github.com/wessberg/browserslist-generator/compare/v0.0.18...v0.0.19) (2018-05-06)

## [0.0.18](https://github.com/wessberg/browserslist-generator/compare/v0.0.17...v0.0.18) (2018-05-06)

## [0.0.17](https://github.com/wessberg/browserslist-generator/compare/v0.0.16...v0.0.17) (2018-05-05)

## [0.0.16](https://github.com/wessberg/browserslist-generator/compare/v0.0.15...v0.0.16) (2018-05-05)

## [0.0.15](https://github.com/wessberg/browserslist-generator/compare/v0.0.14...v0.0.15) (2018-05-05)

## [0.0.14](https://github.com/wessberg/browserslist-generator/compare/v0.0.13...v0.0.14) (2018-05-05)

## [0.0.13](https://github.com/wessberg/browserslist-generator/compare/v0.0.12...v0.0.13) (2018-05-05)

## [0.0.12](https://github.com/wessberg/browserslist-generator/compare/v0.0.11...v0.0.12) (2018-05-05)

## [0.0.11](https://github.com/wessberg/browserslist-generator/compare/v0.0.10...v0.0.11) (2018-05-05)

## [0.0.10](https://github.com/wessberg/browserslist-generator/compare/v0.0.9...v0.0.10) (2018-05-05)

## [0.0.9](https://github.com/wessberg/browserslist-generator/compare/v0.0.8...v0.0.9) (2018-05-05)

## [0.0.8](https://github.com/wessberg/browserslist-generator/compare/v0.0.7...v0.0.8) (2018-05-05)

## [0.0.7](https://github.com/wessberg/browserslist-generator/compare/v0.0.6...v0.0.7) (2018-05-01)

## [0.0.6](https://github.com/wessberg/browserslist-generator/compare/v0.0.5...v0.0.6) (2018-04-30)

## [0.0.5](https://github.com/wessberg/browserslist-generator/compare/v0.0.4...v0.0.5) (2018-04-30)

## 0.0.4 (2018-04-30)
