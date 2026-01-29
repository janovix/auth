# [1.5.0-rc.43](https://github.com/janovix/auth/compare/v1.5.0-rc.42...v1.5.0-rc.43) (2026-01-29)


### Bug Fixes

* **auth:** update Google sign-in callback URL handling for improved redirect logic ([ce9b712](https://github.com/janovix/auth/commit/ce9b712579347e2add71959e02645d53160302bf))

# [1.5.0-rc.42](https://github.com/janovix/auth/compare/v1.5.0-rc.41...v1.5.0-rc.42) (2026-01-28)


### Features

* **auth:** add Google sign-in functionality and update translations ([e515e82](https://github.com/janovix/auth/commit/e515e82cf2be73371bbbc153119ff3f37a8abd98))

# [1.5.0-rc.41](https://github.com/janovix/auth/compare/v1.5.0-rc.40...v1.5.0-rc.41) (2026-01-28)


### Features

* **notifications:** integrate Sentry for error tracking in NotificationsProvider ([6298fe5](https://github.com/janovix/auth/commit/6298fe51ef3585b02af2d967a6264c969112da6d))

# [1.5.0-rc.40](https://github.com/janovix/auth/compare/v1.5.0-rc.39...v1.5.0-rc.40) (2026-01-27)


### Features

* **notifications:** update Tailwind class scanning and replace NotificationsWidget import path ([716a546](https://github.com/janovix/auth/commit/716a5465216431808e9423de18e4ea3471cc276d))

# [1.5.0-rc.39](https://github.com/janovix/auth/compare/v1.5.0-rc.38...v1.5.0-rc.39) (2026-01-27)


### Features

* **notifications:** add NotificationsWidget component and update import path in SettingsLayoutClient ([b2b3a5c](https://github.com/janovix/auth/commit/b2b3a5c660c82f3b0ddffb614e75abf0de763ddd))

# [1.5.0-rc.38](https://github.com/janovix/auth/compare/v1.5.0-rc.37...v1.5.0-rc.38) (2026-01-27)


### Features

* **notifications:** introduce NotificationsWidget component and update import path in SettingsLayoutClient ([4833927](https://github.com/janovix/auth/commit/4833927a370ceb326b36c0def762064049ae3266))

# [1.5.0-rc.37](https://github.com/janovix/auth/compare/v1.5.0-rc.36...v1.5.0-rc.37) (2026-01-27)


### Bug Fixes

* **notifications:** mark older notifications as read per cursor system ([5dca528](https://github.com/janovix/auth/commit/5dca528e6e7c95a9b3dd6484b8f9d6ecfa56471f))

# [1.5.0-rc.36](https://github.com/janovix/auth/compare/v1.5.0-rc.35...v1.5.0-rc.36) (2026-01-27)


### Bug Fixes

* **turnstile:** restrict captcha to auth routes only ([1680300](https://github.com/janovix/auth/commit/16803008dfb468633c6710b6bc6c4b496e541ce8))

# [1.5.0-rc.35](https://github.com/janovix/auth/compare/v1.5.0-rc.34...v1.5.0-rc.35) (2026-01-26)


### Bug Fixes

* **notifications:** use server read status instead of hardcoding false ([24e5ceb](https://github.com/janovix/auth/commit/24e5ceb6d95f0cdc6be28f051e2abd14ac8d3173))

# [1.5.0-rc.34](https://github.com/janovix/auth/compare/v1.5.0-rc.33...v1.5.0-rc.34) (2026-01-26)


### Features

* **notifications:** use async mark-as-read with optimistic updates ([666ff26](https://github.com/janovix/auth/commit/666ff26fc77c727bf514dd77a7468e31c0421a0d))

# [1.5.0-rc.33](https://github.com/janovix/auth/compare/v1.5.0-rc.32...v1.5.0-rc.33) (2026-01-24)


### Features

* update notifications context and SettingsLayoutClient to support local read state and new markAsRead functionality ([3a6f035](https://github.com/janovix/auth/commit/3a6f035ea4461910d0ff69347b1653fe35e2f390))

# [1.5.0-rc.32](https://github.com/janovix/auth/compare/v1.5.0-rc.31...v1.5.0-rc.32) (2026-01-24)


### Features

* enhance SettingsLayoutClient with sound and pulse effects for notifications ([e789444](https://github.com/janovix/auth/commit/e7894448b1884dd702714d17d5374914dcb8387f))

# [1.5.0-rc.31](https://github.com/janovix/auth/compare/v1.5.0-rc.30...v1.5.0-rc.31) (2026-01-23)


### Bug Fixes

* **ui:** add debug logging for semantic-release and improve commit analyzer config ([f8f2440](https://github.com/janovix/auth/commit/f8f2440c2c0a1167b005547475171a082bd7e964))

# [1.5.0-rc.30](https://github.com/janovix/auth/compare/v1.5.0-rc.29...v1.5.0-rc.30) (2026-01-23)


### Bug Fixes

* **ui:** export LanguageSwitcher from package index ([8a932e6](https://github.com/janovix/auth/commit/8a932e6421d1418d2ec2ba568764affda7fd5016))

# [1.5.0-rc.29](https://github.com/janovix/auth/compare/v1.5.0-rc.28...v1.5.0-rc.29) (2026-01-23)


### Bug Fixes

* **ci:** only publish npm package when version changes ([7bc61e7](https://github.com/janovix/auth/commit/7bc61e7b0089d5d0ad2b14a1062bd959a3b98af4))

# [1.5.0-rc.28](https://github.com/janovix/auth/compare/v1.5.0-rc.27...v1.5.0-rc.28) (2026-01-23)


### Features

* add LanguageSwitcher component to @janovix/auth-ui and update README with usage instructions ([cfb4624](https://github.com/janovix/auth/commit/cfb46246d494fb1cf3886e13c9f94f71995222cb))

# [1.5.0-rc.27](https://github.com/janovix/auth/compare/v1.5.0-rc.26...v1.5.0-rc.27) (2026-01-23)


### Bug Fixes

* update @janovix/auth-ui dependency version in package.json and pnpm-lock.yaml to remove caret (^) for consistent versioning ([d6ffd7f](https://github.com/janovix/auth/commit/d6ffd7f2c6fe648f5d34d05c608c4652709f2056))


### Features

* integrate @janovix/auth-ui ThemeSwitcher across components and update dependencies ([b6a126a](https://github.com/janovix/auth/commit/b6a126af4d9a4257107314e088a30e5bd0f4023c))

# [1.5.0-rc.26](https://github.com/janovix/auth/compare/v1.5.0-rc.25...v1.5.0-rc.26) (2026-01-22)


### Features

* add @janovix/auth-ui package with shared UI components ([434f73f](https://github.com/janovix/auth/commit/434f73f851e55a746b4931338926cf35212a1c1e))

# [1.5.0-rc.25](https://github.com/janovix/auth/compare/v1.5.0-rc.24...v1.5.0-rc.25) (2026-01-22)


### Features

* integrate ThemeProvider and LanguageProvider in Storybook preview; enhance BetaAccessView with logo and footer note ([ed7d7fc](https://github.com/janovix/auth/commit/ed7d7fce719af34f05d80ab524d63e1bc434fa97))

# [1.5.0-rc.24](https://github.com/janovix/auth/compare/v1.5.0-rc.23...v1.5.0-rc.24) (2026-01-22)


### Features

* add beta access handling and user role management ([7dcc030](https://github.com/janovix/auth/commit/7dcc0306ae3f07ce67db0929ed3774e73e589921))

# [1.5.0-rc.23](https://github.com/janovix/auth/compare/v1.5.0-rc.22...v1.5.0-rc.23) (2026-01-21)


### Bug Fixes

* add LanguageProvider to LoginView stories and tests ([775e2f2](https://github.com/janovix/auth/commit/775e2f2d7d3e5c83dbddf5cb815860ee64c45d27))

# [1.5.0-rc.22](https://github.com/janovix/auth/compare/v1.5.0-rc.21...v1.5.0-rc.22) (2026-01-20)


### Features

* update scrollbar styles and improve sidebar trigger icon handling ([01f0332](https://github.com/janovix/auth/commit/01f03328ea4e9f37b93385633146641ba9ff6e13))

# [1.5.0-rc.21](https://github.com/janovix/auth/compare/v1.5.0-rc.20...v1.5.0-rc.21) (2026-01-19)


### Features

* enhance OTP resend functionality by introducing pending state for captcha resolution ([43a0162](https://github.com/janovix/auth/commit/43a01625e45e7c517a4ea2e90bf5f6d566b4514e))

# [1.5.0-rc.20](https://github.com/janovix/auth/compare/v1.5.0-rc.19...v1.5.0-rc.20) (2026-01-19)


### Bug Fixes

* improve OTP error messaging by using a consistent translated message for invalid OTP attempts ([0dbedeb](https://github.com/janovix/auth/commit/0dbedeb544299b60e1956f7e4ff2a0da6d3e02c2))

# [1.5.0-rc.19](https://github.com/janovix/auth/compare/v1.5.0-rc.18...v1.5.0-rc.19) (2026-01-19)


### Features

* enhance OTP handling by implementing resend button visibility for TOO_MANY_ATTEMPTS error and removing failed attempts tracking ([de3f167](https://github.com/janovix/auth/commit/de3f167099c95b63561c8e1118f99dfb981ca3fe))

# [1.5.0-rc.18](https://github.com/janovix/auth/compare/v1.5.0-rc.17...v1.5.0-rc.18) (2026-01-19)


### Features

* implement OTP error handling to prevent infinite submission loops and suggest new code after multiple failed attempts ([14849d9](https://github.com/janovix/auth/commit/14849d928f1ce31a3ff393562028d1a487a265e2))

# [1.5.0-rc.17](https://github.com/janovix/auth/compare/v1.5.0-rc.16...v1.5.0-rc.17) (2026-01-17)


### Features

* add email help text to PersonalSettingsView for user guidance ([bb23e12](https://github.com/janovix/auth/commit/bb23e12d7741512d47b88141604441d8c687a831))

# [1.5.0-rc.16](https://github.com/janovix/auth/compare/v1.5.0-rc.15...v1.5.0-rc.16) (2026-01-17)


### Features

* refactor compliance settings retrieval in SettingsLayoutClient to use getAmlComplianceSettings function ([894d04a](https://github.com/janovix/auth/commit/894d04acd72e975baff7bf1e518ef5eaac3a8639))

# [1.5.0-rc.15](https://github.com/janovix/auth/compare/v1.5.0-rc.14...v1.5.0-rc.15) (2026-01-17)


### Features

* refactor subscription status handling in SettingsLayoutClient to use getSubscriptionStatus function ([e49f77d](https://github.com/janovix/auth/commit/e49f77d26c5f104992ef316118ba477b7cbd9288))

# [1.5.0-rc.14](https://github.com/janovix/auth/compare/v1.5.0-rc.13...v1.5.0-rc.14) (2026-01-17)


### Features

* enhance avatar URL handling in PersonalSettingsView to prioritize user.image over settings.avatarUrl ([6a3bf02](https://github.com/janovix/auth/commit/6a3bf02234703827925f661c0d5eebe65c12f56f))

# [1.5.0-rc.13](https://github.com/janovix/auth/compare/v1.5.0-rc.12...v1.5.0-rc.13) (2026-01-17)


### Bug Fixes

* update middleware configuration to exclude monitoring routes from middleware application ([39981de](https://github.com/janovix/auth/commit/39981de7c42aa49ac522777077d29eb46c36b2ec))

# [1.5.0-rc.12](https://github.com/janovix/auth/compare/v1.5.0-rc.11...v1.5.0-rc.12) (2026-01-17)


### Features

* add DeleteOrganizationDialog component with tests and integration into OrganizationSettingsView ([fb5026e](https://github.com/janovix/auth/commit/fb5026e7b1df7bd26f2f5fd34ff1c73c5bd605a4))

# [1.5.0-rc.11](https://github.com/janovix/auth/compare/v1.5.0-rc.10...v1.5.0-rc.11) (2026-01-17)


### Features

* update organization logo handling in OrganizationSettingsView ([f6034ae](https://github.com/janovix/auth/commit/f6034aec1c08a754b7deafb9fc5a4408ec597e03))

# [1.5.0-rc.10](https://github.com/janovix/auth/compare/v1.5.0-rc.9...v1.5.0-rc.10) (2026-01-17)


### Bug Fixes

* clarify onChange behavior in AvatarEditorDialog when using onSave handler ([afc508e](https://github.com/janovix/auth/commit/afc508eeb01764c8dcc26a4ad4d3d5bd8298a1ab))

# [1.5.0-rc.9](https://github.com/janovix/auth/compare/v1.5.0-rc.8...v1.5.0-rc.9) (2026-01-17)


### Features

* update user profile image handling in PersonalSettingsView ([faf6859](https://github.com/janovix/auth/commit/faf68597bea0b1df77b96d8978da8dd769a01f15))

# [1.5.0-rc.8](https://github.com/janovix/auth/compare/v1.5.0-rc.7...v1.5.0-rc.8) (2026-01-17)


### Features

* enhance AvatarEditor with high-quality image smoothing and retina display support ([7caf547](https://github.com/janovix/auth/commit/7caf547359d8a63095006f54c9c6be348307892a)), closes [hi#quality](https://github.com/hi/issues/quality)

# [1.5.0-rc.7](https://github.com/janovix/auth/compare/v1.5.0-rc.6...v1.5.0-rc.7) (2026-01-17)


### Bug Fixes

* adjust layout of AvatarEditor in AvatarEditorDialog for better responsiveness ([567f94c](https://github.com/janovix/auth/commit/567f94c8e9f5d7ae105983d2a01b16293ff6c85e))

# [1.5.0-rc.6](https://github.com/janovix/auth/compare/v1.5.0-rc.5...v1.5.0-rc.6) (2026-01-17)


### Features

* add common and avatar-related translations for onboarding and settings in English and Spanish ([edc6c3a](https://github.com/janovix/auth/commit/edc6c3a0fd4e778bb31498152a55c90da178bceb))

# [1.5.0-rc.5](https://github.com/janovix/auth/compare/v1.5.0-rc.4...v1.5.0-rc.5) (2026-01-16)


### Features

* add new UI components for organization management, including CreateOrganizationView and associated settings, and implement timezone picker functionality ([b04b6b7](https://github.com/janovix/auth/commit/b04b6b7a6730ac5f4ca1cfb62ade2be572bc64a7))

# [1.5.0-rc.4](https://github.com/janovix/auth/compare/v1.5.0-rc.3...v1.5.0-rc.4) (2026-01-15)


### Bug Fixes

* update success message display logic in LoginView to ensure correct rendering based on OTP state ([9bbc027](https://github.com/janovix/auth/commit/9bbc027f8c3313024a7610aee8d70059fafe9976))

# [1.5.0-rc.3](https://github.com/janovix/auth/compare/v1.5.0-rc.2...v1.5.0-rc.3) (2026-01-14)


### Features

* add banned user handling in LoginView with corresponding tests and translations ([dd15d98](https://github.com/janovix/auth/commit/dd15d981bb43f12c66f101103a41ef66a7a239c6))

# [1.5.0-rc.2](https://github.com/janovix/auth/compare/v1.5.0-rc.1...v1.5.0-rc.2) (2026-01-14)


### Features

* add onboarding steps and UI components for organization management, including avatar upload and subscription selection ([1d83d7d](https://github.com/janovix/auth/commit/1d83d7d5ff04847717ca5bc70b6b80e3855ed109))
* implement theme synchronization and upgrade prompts in billing components ([83c001c](https://github.com/janovix/auth/commit/83c001c97c995e70faad837dc25cb5a1eb43fcc4))
* integrate Turnstile Captcha for enhanced OTP resend functionality in LoginView ([9e64176](https://github.com/janovix/auth/commit/9e6417694f11b17e30ca653b92b9d1ab0637d9df))

# [1.5.0-rc.1](https://github.com/janovix/auth/compare/v1.4.0...v1.5.0-rc.1) (2026-01-12)


### Features

* add audit and settings components with associated tests ([3ceaae6](https://github.com/janovix/auth/commit/3ceaae62226d83dd90e4c86d096462a6475dd584))
* add settings management components and integrate Radix UI for improved UI elements ([e800447](https://github.com/janovix/auth/commit/e800447b7e4ddf0d1730e9aee0b1e6299e4ca9b0))
* add storybook components for UI elements ([75320a1](https://github.com/janovix/auth/commit/75320a1f6ef2be163eb539551ee5fde740071b85))
* enhance settings management with new middleware for route protection and organization selection ([2648d23](https://github.com/janovix/auth/commit/2648d2366c91aa81ae0de9ff1f4f81b99e25094d))
* implement billing settings management with new components for subscription, invoices, and license activation ([5d31229](https://github.com/janovix/auth/commit/5d3122950061cf8fa5e611f7a02f195ae4704914))
* implement organization settings management in SettingsView component ([0c01349](https://github.com/janovix/auth/commit/0c01349d52f071be8f6f5b31fedf9fdd257ca8a4))

# [1.4.0](https://github.com/janovix/auth/compare/v1.3.0...v1.4.0) (2026-01-09)


### Features

* Integrate Sentry for error monitoring and tracing ([25e2c21](https://github.com/janovix/auth/commit/25e2c21ebc0fc858fac6e2cc92f61f82e414aa66))

# [1.3.0](https://github.com/janovix/auth/compare/v1.2.0...v1.3.0) (2026-01-08)


### Bug Fixes

* add __name polyfill for next-themes esbuild compatibility ([98336f6](https://github.com/janovix/auth/commit/98336f6c0f064a72b633fafb949d91c93d967269))
* **middleware:** validate session with auth service ([e8e7c80](https://github.com/janovix/auth/commit/e8e7c802be91e1e8e271c724444f051ab8b4eaf2))
* restore organizationClient plugin for aml-janovix compatibility ([a62e2c2](https://github.com/janovix/auth/commit/a62e2c2829deef44484b98c076a627091e5ff8d3))
* **signup:** hide form fields after successful signup with verification ([fcf26fc](https://github.com/janovix/auth/commit/fcf26fce6f68011b05959bad2e8c1f3a79c9f013))
* update password reset to use Better Auth client methods ([76c9938](https://github.com/janovix/auth/commit/76c99380108bc800cc04f31f8efa34be877601dd))
* **verify:** add /verify to auth layout for consistent styling ([02b1c14](https://github.com/janovix/auth/commit/02b1c145eabccc71fdba79dc294c4a2d123be843))


### Features

* add email verification UI support ([0e6178e](https://github.com/janovix/auth/commit/0e6178e31eeeb9f4468b31881e6a5016174aa8d3))
* Add internationalization and language switcher ([74f5fc0](https://github.com/janovix/auth/commit/74f5fc0838bb1dc28ddec4e94c652258355e56d1))
* Add login success animation and redirect ([1de6eb6](https://github.com/janovix/auth/commit/1de6eb629e5d91a7269bcc1353f60cd6ec184404))
* add Turnstile widget to password recovery form ([609b15d](https://github.com/janovix/auth/commit/609b15d1226500a35b7e6338f18353831e10d27b))
* **auth:** add 60s cooldown timer on password reset request ([bca6da2](https://github.com/janovix/auth/commit/bca6da21820778f29b055b56a563d772b602eff5))
* **auth:** improve verify email UI and signup verification message ([e8314ff](https://github.com/janovix/auth/commit/e8314ff26626f2125807e7150d4e2cae7e13c1a9))
* Implement aurora background animations and context ([2b0c8c8](https://github.com/janovix/auth/commit/2b0c8c834ab91b3f2208d7441bf59d4b77f6a553))
* implement OTP-based passwordless auth, remove password recovery ([665c4b5](https://github.com/janovix/auth/commit/665c4b50fc9fa38cbd55a6e1977a53486a41300e))
* implement OTP-based passwordless auth, remove password recovery ([e1138f0](https://github.com/janovix/auth/commit/e1138f0a1297915b7cb810d32de09b90d827994a))
* Implement shadcn-ui theme switcher component ([cc6d5ab](https://github.com/janovix/auth/commit/cc6d5ab134fe95429271213ea2995ef708837976))
* **signup:** add 10s countdown before redirect to login after signup ([2fe25ce](https://github.com/janovix/auth/commit/2fe25ce7fb39588e0fdcc87d94e8e008a8f93efa))

# [1.3.0-rc.1](https://github.com/janovix/auth/compare/v1.2.0...v1.3.0-rc.1) (2026-01-08)


### Bug Fixes

* add __name polyfill for next-themes esbuild compatibility ([98336f6](https://github.com/janovix/auth/commit/98336f6c0f064a72b633fafb949d91c93d967269))
* **middleware:** validate session with auth service ([e8e7c80](https://github.com/janovix/auth/commit/e8e7c802be91e1e8e271c724444f051ab8b4eaf2))
* restore organizationClient plugin for aml-janovix compatibility ([a62e2c2](https://github.com/janovix/auth/commit/a62e2c2829deef44484b98c076a627091e5ff8d3))
* **signup:** hide form fields after successful signup with verification ([fcf26fc](https://github.com/janovix/auth/commit/fcf26fce6f68011b05959bad2e8c1f3a79c9f013))
* update password reset to use Better Auth client methods ([76c9938](https://github.com/janovix/auth/commit/76c99380108bc800cc04f31f8efa34be877601dd))
* **verify:** add /verify to auth layout for consistent styling ([02b1c14](https://github.com/janovix/auth/commit/02b1c145eabccc71fdba79dc294c4a2d123be843))


### Features

* add email verification UI support ([0e6178e](https://github.com/janovix/auth/commit/0e6178e31eeeb9f4468b31881e6a5016174aa8d3))
* Add internationalization and language switcher ([74f5fc0](https://github.com/janovix/auth/commit/74f5fc0838bb1dc28ddec4e94c652258355e56d1))
* Add login success animation and redirect ([1de6eb6](https://github.com/janovix/auth/commit/1de6eb629e5d91a7269bcc1353f60cd6ec184404))
* add Turnstile widget to password recovery form ([609b15d](https://github.com/janovix/auth/commit/609b15d1226500a35b7e6338f18353831e10d27b))
* **auth:** add 60s cooldown timer on password reset request ([bca6da2](https://github.com/janovix/auth/commit/bca6da21820778f29b055b56a563d772b602eff5))
* **auth:** improve verify email UI and signup verification message ([e8314ff](https://github.com/janovix/auth/commit/e8314ff26626f2125807e7150d4e2cae7e13c1a9))
* Implement aurora background animations and context ([2b0c8c8](https://github.com/janovix/auth/commit/2b0c8c834ab91b3f2208d7441bf59d4b77f6a553))
* implement OTP-based passwordless auth, remove password recovery ([665c4b5](https://github.com/janovix/auth/commit/665c4b50fc9fa38cbd55a6e1977a53486a41300e))
* implement OTP-based passwordless auth, remove password recovery ([e1138f0](https://github.com/janovix/auth/commit/e1138f0a1297915b7cb810d32de09b90d827994a))
* Implement shadcn-ui theme switcher component ([cc6d5ab](https://github.com/janovix/auth/commit/cc6d5ab134fe95429271213ea2995ef708837976))
* **signup:** add 10s countdown before redirect to login after signup ([2fe25ce](https://github.com/janovix/auth/commit/2fe25ce7fb39588e0fdcc87d94e8e008a8f93efa))

# [1.2.0](https://github.com/janovix/auth/compare/v1.1.0...v1.2.0) (2025-12-30)

### Features

* **auth:** integrate organizationClient plugin into authClient configuration ([b0d608d](https://github.com/janovix/auth/commit/b0d608d4af233489a31fbc759b1be098835b7340))

# [1.2.0-rc.6](https://github.com/janovix/auth/compare/v1.2.0-rc.5...v1.2.0-rc.6) (2026-01-08)

### Features

* Add internationalization and language switcher ([74f5fc0](https://github.com/janovix/auth/commit/74f5fc0838bb1dc28ddec4e94c652258355e56d1))
* Implement shadcn-ui theme switcher component ([cc6d5ab](https://github.com/janovix/auth/commit/cc6d5ab134fe95429271213ea2995ef708837976))

# [1.2.0-rc.5](https://github.com/janovix/auth/compare/v1.2.0-rc.4...v1.2.0-rc.5) (2026-01-08)


### Features

* Add login success animation and redirect ([1de6eb6](https://github.com/janovix/auth/commit/1de6eb629e5d91a7269bcc1353f60cd6ec184404))
* Implement aurora background animations and context ([2b0c8c8](https://github.com/janovix/auth/commit/2b0c8c834ab91b3f2208d7441bf59d4b77f6a553))

# [1.2.0-rc.4](https://github.com/janovix/auth/compare/v1.2.0-rc.3...v1.2.0-rc.4) (2026-01-08)


### Bug Fixes

* restore organizationClient plugin for aml-janovix compatibility ([a62e2c2](https://github.com/janovix/auth/commit/a62e2c2829deef44484b98c076a627091e5ff8d3))

# [1.2.0-rc.3](https://github.com/janovix/auth/compare/v1.2.0-rc.2...v1.2.0-rc.3) (2026-01-08)


### Features

* implement OTP-based passwordless auth, remove password recovery ([665c4b5](https://github.com/janovix/auth/commit/665c4b50fc9fa38cbd55a6e1977a53486a41300e))

# [1.2.0-rc.2](https://github.com/janovix/auth/compare/v1.2.0-rc.1...v1.2.0-rc.2) (2026-01-08)


### Features

* implement OTP-based passwordless auth, remove password recovery ([e1138f0](https://github.com/janovix/auth/commit/e1138f0a1297915b7cb810d32de09b90d827994a))

# [1.2.0-rc.1](https://github.com/janovix/auth/compare/v1.1.0...v1.2.0-rc.1) (2025-12-30)


### Bug Fixes

* add __name polyfill for next-themes esbuild compatibility ([98336f6](https://github.com/janovix/auth/commit/98336f6c0f064a72b633fafb949d91c93d967269))
* **middleware:** validate session with auth service ([e8e7c80](https://github.com/janovix/auth/commit/e8e7c802be91e1e8e271c724444f051ab8b4eaf2))
* **signup:** hide form fields after successful signup with verification ([fcf26fc](https://github.com/janovix/auth/commit/fcf26fce6f68011b05959bad2e8c1f3a79c9f013))
* update password reset to use Better Auth client methods ([76c9938](https://github.com/janovix/auth/commit/76c99380108bc800cc04f31f8efa34be877601dd))
* **verify:** add /verify to auth layout for consistent styling ([02b1c14](https://github.com/janovix/auth/commit/02b1c145eabccc71fdba79dc294c4a2d123be843))


### Features

* add email verification UI support ([0e6178e](https://github.com/janovix/auth/commit/0e6178e31eeeb9f4468b31881e6a5016174aa8d3))
* add Turnstile widget to password recovery form ([609b15d](https://github.com/janovix/auth/commit/609b15d1226500a35b7e6338f18353831e10d27b))
* **auth:** add 60s cooldown timer on password reset request ([bca6da2](https://github.com/janovix/auth/commit/bca6da21820778f29b055b56a563d772b602eff5))
* **auth:** improve verify email UI and signup verification message ([e8314ff](https://github.com/janovix/auth/commit/e8314ff26626f2125807e7150d4e2cae7e13c1a9))
* **auth:** integrate organizationClient plugin into authClient configuration ([b0d608d](https://github.com/janovix/auth/commit/b0d608d4af233489a31fbc759b1be098835b7340))
* **signup:** add 10s countdown before redirect to login after signup ([2fe25ce](https://github.com/janovix/auth/commit/2fe25ce7fb39588e0fdcc87d94e8e008a8f93efa))


# [1.1.0](https://github.com/janovix/auth/compare/v1.0.0...v1.1.0) (2025-12-19)


### Bug Fixes

* **auth:** ensure SDK initialization before component rendering ([af33986](https://github.com/janovix/auth/commit/af33986a5ad04003efa5d0cbf53c997d8639b05b))
* **auth:** use auth-svc.janovix.workers.dev for dev/preview environments ([1b55b37](https://github.com/janovix/auth/commit/1b55b3780646eae003e48fbb809d574a91119cc0))
* **config:** require https:// protocol and remove fallbacks for clearer errors ([25a8e15](https://github.com/janovix/auth/commit/25a8e15fff93189e63f191ae19c47b0bc375e907))
* improved sdk avoiding code splitting ([6a01429](https://github.com/janovix/auth/commit/6a01429f57f52775828d3c440b4f6b56f8c8df8e))
* integrate device detection hook and update component logic ([18a14df](https://github.com/janovix/auth/commit/18a14df66ce7361d4366ee4c2ca448cb5f3b7c29))
* logout feature ([ae343cc](https://github.com/janovix/auth/commit/ae343cc0c2edac6515703a1d70797b93bfeae844))
* problems with auth sdk initialization ([4086778](https://github.com/janovix/auth/commit/4086778b80629ee46af27fb95a4aceb21e87f23a))
* response from success signin match ([9a128f3](https://github.com/janovix/auth/commit/9a128f3984ede41805eda33a482d2b7a11ab3887))
* **storybook:** add https:// to build-storybook.mjs env fallbacks ([fc38019](https://github.com/janovix/auth/commit/fc380199f45fc7ebd67fb89f0a6c7add224ba1ff))
* **storybook:** add https:// to default env vars for Chromatic builds ([cf9f880](https://github.com/janovix/auth/commit/cf9f8802a4b8c871c054df2b70e4e0d8497c4644))
* **storybook:** install webpack as dev dependency for DefinePlugin ([c5253f9](https://github.com/janovix/auth/commit/c5253f9c9031db3f648d5f733e09bcdefb7b788c))
* **storybook:** set AUTH_CORE_BASE_URL environment variables for Storybook builds ([9015436](https://github.com/janovix/auth/commit/9015436bb962c493029db33473970f658e9b905d))


### Features

* Add animated background and loading skeleton to login page ([0014170](https://github.com/janovix/auth/commit/0014170e5c83b577c34f5235020d1daece2c81fa))
* Add auth pages and components ([6374275](https://github.com/janovix/auth/commit/6374275d8b6b270937e0d54c11188d213c0c307f))
* Add error handling and improve tests for auth components ([f7b60f6](https://github.com/janovix/auth/commit/f7b60f647f238846c5367dfb467ac31e23c8e65e))
* Add login animation and two-column layout ([f8443d5](https://github.com/janovix/auth/commit/f8443d548bd741ac83a9aa292b0f4545c6ada3d4))
* Add minimal scrollbar styling to globals.css ([3671a68](https://github.com/janovix/auth/commit/3671a680f9967b3cab65c5809e55700b5d39a6d5))
* Add real-time password validation to auth forms ([80b4fec](https://github.com/janovix/auth/commit/80b4fecd1cf590519f72bb4061879f8abba5926e))
* add redirect_to param and NEXT_PUBLIC_AUTH_REDIRECT_URL support ([ccef396](https://github.com/janovix/auth/commit/ccef3960ca09ee2279742f9de27c30fce1f45d55))
* Add Storybook stories for UI components and pages ([52e2c6b](https://github.com/janovix/auth/commit/52e2c6bdef093850fa880543c0f9398303fc09a2))
* Add tests for auth components and utilities ([4d1b7c9](https://github.com/janovix/auth/commit/4d1b7c9fe227f4b3ad6f65b7360d4952cf4c70cd))
* **auth:** add Next.js middleware for session management and route protection ([b39ac7b](https://github.com/janovix/auth/commit/b39ac7ba2e9ce8df106f8104b26938c9cd64855e))
* **auth:** enhance LoginView with session handling and redirection ([6eeff25](https://github.com/janovix/auth/commit/6eeff25c6ac0f62eba8135df2436ca4865003ffb))
* **auth:** implement Next.js 16 proxy for session management and enhance AccountView with server-side session fetching ([b54a560](https://github.com/janovix/auth/commit/b54a56063a77ac0147b5e891db76839ca8b5b230))
* **auth:** implement SessionHydrator for improved session management in AccountView ([2e9f843](https://github.com/janovix/auth/commit/2e9f843b3db6909d79cac008eaf5c7395d25fb6d))
* **auth:** integrate @algenium/auth-next SDK for auth operations ([c0c3de2](https://github.com/janovix/auth/commit/c0c3de2ef508edd59b45a45496d22e07f4ca805d))
* Configure build env vars and dynamic rendering ([9a0180a](https://github.com/janovix/auth/commit/9a0180a044e9076acf73af2874eb0290f2e8f786))
* Mock next/navigation for Storybook ([9383c12](https://github.com/janovix/auth/commit/9383c1250511db9c89ffa786cfe60aadc805347b))
* updated layout and visuals, added animated background ([27b1314](https://github.com/janovix/auth/commit/27b1314acf502c5754f313ced16e3526df5e929a))

# [1.1.0-rc.17](https://github.com/janovix/auth/compare/v1.1.0-rc.16...v1.1.0-rc.17) (2025-12-20)


### Bug Fixes

* **signup:** hide form fields after successful signup with verification ([fcf26fc](https://github.com/janovix/auth/commit/fcf26fce6f68011b05959bad2e8c1f3a79c9f013))

# [1.1.0-rc.16](https://github.com/janovix/auth/compare/v1.1.0-rc.15...v1.1.0-rc.16) (2025-12-20)


### Bug Fixes

* **verify:** add /verify to auth layout for consistent styling ([02b1c14](https://github.com/janovix/auth/commit/02b1c145eabccc71fdba79dc294c4a2d123be843))

# [1.1.0-rc.15](https://github.com/janovix/auth/compare/v1.1.0-rc.14...v1.1.0-rc.15) (2025-12-20)


### Features

* **signup:** add 10s countdown before redirect to login after signup ([2fe25ce](https://github.com/janovix/auth/commit/2fe25ce7fb39588e0fdcc87d94e8e008a8f93efa))

# [1.1.0-rc.14](https://github.com/janovix/auth/compare/v1.1.0-rc.13...v1.1.0-rc.14) (2025-12-20)


### Features

* **auth:** improve verify email UI and signup verification message ([e8314ff](https://github.com/janovix/auth/commit/e8314ff26626f2125807e7150d4e2cae7e13c1a9))

# [1.1.0-rc.13](https://github.com/janovix/auth/compare/v1.1.0-rc.12...v1.1.0-rc.13) (2025-12-20)


### Bug Fixes

* add __name polyfill for next-themes esbuild compatibility ([98336f6](https://github.com/janovix/auth/commit/98336f6c0f064a72b633fafb949d91c93d967269))

# [1.1.0-rc.12](https://github.com/janovix/auth/compare/v1.1.0-rc.11...v1.1.0-rc.12) (2025-12-20)


### Features

* add email verification UI support ([0e6178e](https://github.com/janovix/auth/commit/0e6178e31eeeb9f4468b31881e6a5016174aa8d3))

# [1.1.0-rc.11](https://github.com/janovix/auth/compare/v1.1.0-rc.10...v1.1.0-rc.11) (2025-12-20)


### Features

* **auth:** add 60s cooldown timer on password reset request ([bca6da2](https://github.com/janovix/auth/commit/bca6da21820778f29b055b56a563d772b602eff5))

# [1.1.0-rc.10](https://github.com/janovix/auth/compare/v1.1.0-rc.9...v1.1.0-rc.10) (2025-12-20)


### Features

* add Turnstile widget to password recovery form ([609b15d](https://github.com/janovix/auth/commit/609b15d1226500a35b7e6338f18353831e10d27b))

# [1.1.0-rc.9](https://github.com/janovix/auth/compare/v1.1.0-rc.8...v1.1.0-rc.9) (2025-12-19)


### Bug Fixes

* update password reset to use Better Auth client methods ([76c9938](https://github.com/janovix/auth/commit/76c99380108bc800cc04f31f8efa34be877601dd))

# [1.1.0-rc.8](https://github.com/janovix/auth/compare/v1.1.0-rc.7...v1.1.0-rc.8) (2025-12-19)


### Bug Fixes

* **middleware:** validate session with auth service ([e8e7c80](https://github.com/janovix/auth/commit/e8e7c802be91e1e8e271c724444f051ab8b4eaf2))

# [1.1.0-rc.7](https://github.com/janovix/auth/compare/v1.1.0-rc.6...v1.1.0-rc.7) (2025-12-18)


### Features

* add redirect_to param and NEXT_PUBLIC_AUTH_REDIRECT_URL support ([ccef396](https://github.com/janovix/auth/commit/ccef3960ca09ee2279742f9de27c30fce1f45d55))

# [1.1.0-rc.6](https://github.com/janovix/auth/compare/v1.1.0-rc.5...v1.1.0-rc.6) (2025-12-17)


### Bug Fixes

* logout feature ([ae343cc](https://github.com/janovix/auth/commit/ae343cc0c2edac6515703a1d70797b93bfeae844))

# [1.1.0-rc.5](https://github.com/janovix/auth/compare/v1.1.0-rc.4...v1.1.0-rc.5) (2025-12-17)


### Bug Fixes

* response from success signin match ([9a128f3](https://github.com/janovix/auth/commit/9a128f3984ede41805eda33a482d2b7a11ab3887))

# [1.1.0-rc.4](https://github.com/janovix/auth/compare/v1.1.0-rc.3...v1.1.0-rc.4) (2025-12-17)


### Bug Fixes

* improved sdk avoiding code splitting ([6a01429](https://github.com/janovix/auth/commit/6a01429f57f52775828d3c440b4f6b56f8c8df8e))

# [1.1.0-rc.3](https://github.com/janovix/auth/compare/v1.1.0-rc.2...v1.1.0-rc.3) (2025-12-17)


### Bug Fixes

* problems with auth sdk initialization ([4086778](https://github.com/janovix/auth/commit/4086778b80629ee46af27fb95a4aceb21e87f23a))

# [1.1.0-rc.2](https://github.com/janovix/auth/compare/v1.1.0-rc.1...v1.1.0-rc.2) (2025-12-17)


### Bug Fixes

* **storybook:** add https:// to build-storybook.mjs env fallbacks ([fc38019](https://github.com/janovix/auth/commit/fc380199f45fc7ebd67fb89f0a6c7add224ba1ff))

# [1.1.0-rc.1](https://github.com/janovix/auth/compare/v1.0.0...v1.1.0-rc.1) (2025-12-17)


### Bug Fixes

* **auth:** ensure SDK initialization before component rendering ([af33986](https://github.com/janovix/auth/commit/af33986a5ad04003efa5d0cbf53c997d8639b05b))
* **auth:** use auth-svc.janovix.workers.dev for dev/preview environments ([1b55b37](https://github.com/janovix/auth/commit/1b55b3780646eae003e48fbb809d574a91119cc0))
* **config:** require https:// protocol and remove fallbacks for clearer errors ([25a8e15](https://github.com/janovix/auth/commit/25a8e15fff93189e63f191ae19c47b0bc375e907))
* integrate device detection hook and update component logic ([18a14df](https://github.com/janovix/auth/commit/18a14df66ce7361d4366ee4c2ca448cb5f3b7c29))
* **storybook:** add https:// to default env vars for Chromatic builds ([cf9f880](https://github.com/janovix/auth/commit/cf9f8802a4b8c871c054df2b70e4e0d8497c4644))
* **storybook:** install webpack as dev dependency for DefinePlugin ([c5253f9](https://github.com/janovix/auth/commit/c5253f9c9031db3f648d5f733e09bcdefb7b788c))
* **storybook:** set AUTH_CORE_BASE_URL environment variables for Storybook builds ([9015436](https://github.com/janovix/auth/commit/9015436bb962c493029db33473970f658e9b905d))


### Features

* Add animated background and loading skeleton to login page ([0014170](https://github.com/janovix/auth/commit/0014170e5c83b577c34f5235020d1daece2c81fa))
* Add auth pages and components ([6374275](https://github.com/janovix/auth/commit/6374275d8b6b270937e0d54c11188d213c0c307f))
* Add error handling and improve tests for auth components ([f7b60f6](https://github.com/janovix/auth/commit/f7b60f647f238846c5367dfb467ac31e23c8e65e))
* Add login animation and two-column layout ([f8443d5](https://github.com/janovix/auth/commit/f8443d548bd741ac83a9aa292b0f4545c6ada3d4))
* Add minimal scrollbar styling to globals.css ([3671a68](https://github.com/janovix/auth/commit/3671a680f9967b3cab65c5809e55700b5d39a6d5))
* Add real-time password validation to auth forms ([80b4fec](https://github.com/janovix/auth/commit/80b4fecd1cf590519f72bb4061879f8abba5926e))
* Add Storybook stories for UI components and pages ([52e2c6b](https://github.com/janovix/auth/commit/52e2c6bdef093850fa880543c0f9398303fc09a2))
* Add tests for auth components and utilities ([4d1b7c9](https://github.com/janovix/auth/commit/4d1b7c9fe227f4b3ad6f65b7360d4952cf4c70cd))
* **auth:** add Next.js middleware for session management and route protection ([b39ac7b](https://github.com/janovix/auth/commit/b39ac7ba2e9ce8df106f8104b26938c9cd64855e))
* **auth:** enhance LoginView with session handling and redirection ([6eeff25](https://github.com/janovix/auth/commit/6eeff25c6ac0f62eba8135df2436ca4865003ffb))
* **auth:** implement Next.js 16 proxy for session management and enhance AccountView with server-side session fetching ([b54a560](https://github.com/janovix/auth/commit/b54a56063a77ac0147b5e891db76839ca8b5b230))
* **auth:** implement SessionHydrator for improved session management in AccountView ([2e9f843](https://github.com/janovix/auth/commit/2e9f843b3db6909d79cac008eaf5c7395d25fb6d))
* **auth:** integrate @algenium/auth-next SDK for auth operations ([c0c3de2](https://github.com/janovix/auth/commit/c0c3de2ef508edd59b45a45496d22e07f4ca805d))
* Configure build env vars and dynamic rendering ([9a0180a](https://github.com/janovix/auth/commit/9a0180a044e9076acf73af2874eb0290f2e8f786))
* Mock next/navigation for Storybook ([9383c12](https://github.com/janovix/auth/commit/9383c1250511db9c89ffa786cfe60aadc805347b))
* updated layout and visuals, added animated background ([27b1314](https://github.com/janovix/auth/commit/27b1314acf502c5754f313ced16e3526df5e929a))

# [1.0.0-rc.15](https://github.com/janovix/auth/compare/v1.0.0-rc.14...v1.0.0-rc.15) (2025-12-17)


### Features

* Add minimal scrollbar styling to globals.css ([3671a68](https://github.com/janovix/auth/commit/3671a680f9967b3cab65c5809e55700b5d39a6d5))
* Configure build env vars and dynamic rendering ([9a0180a](https://github.com/janovix/auth/commit/9a0180a044e9076acf73af2874eb0290f2e8f786))

# [1.0.0-rc.14](https://github.com/janovix/auth/compare/v1.0.0-rc.13...v1.0.0-rc.14) (2025-12-17)


### Bug Fixes

* **storybook:** add https:// to default env vars for Chromatic builds ([cf9f880](https://github.com/janovix/auth/commit/cf9f8802a4b8c871c054df2b70e4e0d8497c4644))

# [1.0.0-rc.13](https://github.com/janovix/auth/compare/v1.0.0-rc.12...v1.0.0-rc.13) (2025-12-17)


### Bug Fixes

* **config:** require https:// protocol and remove fallbacks for clearer errors ([25a8e15](https://github.com/janovix/auth/commit/25a8e15fff93189e63f191ae19c47b0bc375e907))

# [1.0.0-rc.12](https://github.com/janovix/auth/compare/v1.0.0-rc.11...v1.0.0-rc.12) (2025-12-17)


### Bug Fixes

* **auth:** ensure SDK initialization before component rendering ([af33986](https://github.com/janovix/auth/commit/af33986a5ad04003efa5d0cbf53c997d8639b05b))

# [1.0.0-rc.11](https://github.com/janovix/auth/compare/v1.0.0-rc.10...v1.0.0-rc.11) (2025-12-17)


### Features

* **auth:** integrate @algenium/auth-next SDK for auth operations ([c0c3de2](https://github.com/janovix/auth/commit/c0c3de2ef508edd59b45a45496d22e07f4ca805d))

# [1.0.0-rc.10](https://github.com/janovix/auth/compare/v1.0.0-rc.9...v1.0.0-rc.10) (2025-12-17)


### Features

* Add Storybook stories for UI components and pages ([52e2c6b](https://github.com/janovix/auth/commit/52e2c6bdef093850fa880543c0f9398303fc09a2))
* Mock next/navigation for Storybook ([9383c12](https://github.com/janovix/auth/commit/9383c1250511db9c89ffa786cfe60aadc805347b))

# [1.0.0-rc.9](https://github.com/janovix/auth/compare/v1.0.0-rc.8...v1.0.0-rc.9) (2025-12-17)


### Features

* Add real-time password validation to auth forms ([80b4fec](https://github.com/janovix/auth/commit/80b4fecd1cf590519f72bb4061879f8abba5926e))

# [1.0.0-rc.8](https://github.com/janovix/auth/compare/v1.0.0-rc.7...v1.0.0-rc.8) (2025-12-17)


### Bug Fixes

* integrate device detection hook and update component logic ([18a14df](https://github.com/janovix/auth/commit/18a14df66ce7361d4366ee4c2ca448cb5f3b7c29))


### Features

* Add animated background and loading skeleton to login page ([0014170](https://github.com/janovix/auth/commit/0014170e5c83b577c34f5235020d1daece2c81fa))
* Add login animation and two-column layout ([f8443d5](https://github.com/janovix/auth/commit/f8443d548bd741ac83a9aa292b0f4545c6ada3d4))
* updated layout and visuals, added animated background ([27b1314](https://github.com/janovix/auth/commit/27b1314acf502c5754f313ced16e3526df5e929a))

# [1.0.0-rc.7](https://github.com/janovix/auth/compare/v1.0.0-rc.6...v1.0.0-rc.7) (2025-12-16)


### Features

* **auth:** implement SessionHydrator for improved session management in AccountView ([2e9f843](https://github.com/janovix/auth/commit/2e9f843b3db6909d79cac008eaf5c7395d25fb6d))

# [1.0.0-rc.6](https://github.com/janovix/auth/compare/v1.0.0-rc.5...v1.0.0-rc.6) (2025-12-16)


### Features

* **auth:** add Next.js middleware for session management and route protection ([b39ac7b](https://github.com/janovix/auth/commit/b39ac7ba2e9ce8df106f8104b26938c9cd64855e))

# [1.0.0-rc.5](https://github.com/janovix/auth/compare/v1.0.0-rc.4...v1.0.0-rc.5) (2025-12-16)


### Features

* **auth:** implement Next.js 16 proxy for session management and enhance AccountView with server-side session fetching ([b54a560](https://github.com/janovix/auth/commit/b54a56063a77ac0147b5e891db76839ca8b5b230))


# [1.0.0-rc.4](https://github.com/algtools/next-template/compare/v1.0.0-rc.3...v1.0.0-rc.4) (2025-12-14)


### Features

* Add core functionality ([1cfb1d8](https://github.com/algtools/next-template/commit/1cfb1d8bb6bd41aa3e7d2808b143d41c56d183dd))

# [1.0.0-rc.3](https://github.com/algtools/next-template/compare/v1.0.0-rc.2...v1.0.0-rc.3) (2025-12-13)


### Bug Fixes

* update CI workflow to skip Chromatic publishing on 'dev' branch ([17b1390](https://github.com/algtools/next-template/commit/17b1390591887196d224e5b7e6f214b824b93372))

# [1.0.0-rc.2](https://github.com/algtools/next-template/compare/v1.0.0-rc.1...v1.0.0-rc.2) (2025-12-13)


### Features

* integrate storybook ([72c57c8](https://github.com/algtools/next-template/commit/72c57c8bc2114ba1bfa9e993f479edf5198ec87c))

# 1.0.0-rc.1 (2025-12-13)


### Bug Fixes

* adding cf build script ([e4304da](https://github.com/algtools/next-template/commit/e4304dae686a6cabe53f20a6a88d73f6d6d1dbbe))


### Features

* add TodoApp component with local storage support and UI enhancements ([dd9a9e6](https://github.com/algtools/next-template/commit/dd9a9e68c5bccca24531aa595efd47143bc59ba4))
* Integrate SWR for data fetching and update TodoApp ([ee15a61](https://github.com/algtools/next-template/commit/ee15a6143cea5dacef562c97ee6ed7cd8f7241e6))

# 1.0.0 (2025-12-14)


### Bug Fixes

* adding cf build script ([e4304da](https://github.com/algtools/next-template/commit/e4304dae686a6cabe53f20a6a88d73f6d6d1dbbe))
* update CI workflow to skip Chromatic publishing on 'dev' branch ([17b1390](https://github.com/algtools/next-template/commit/17b1390591887196d224e5b7e6f214b824b93372))


### Features

* Add core functionality ([1cfb1d8](https://github.com/algtools/next-template/commit/1cfb1d8bb6bd41aa3e7d2808b143d41c56d183dd))
* add TodoApp component with local storage support and UI enhancements ([dd9a9e6](https://github.com/algtools/next-template/commit/dd9a9e68c5bccca24531aa595efd47143bc59ba4))
* integrate storybook ([72c57c8](https://github.com/algtools/next-template/commit/72c57c8bc2114ba1bfa9e993f479edf5198ec87c))
* Integrate SWR for data fetching and update TodoApp ([ee15a61](https://github.com/algtools/next-template/commit/ee15a6143cea5dacef562c97ee6ed7cd8f7241e6))

# Changelog

All notable changes to this project will be documented in this file.
