import test from 'japa'
import { expect } from 'chai'
import AdonisApplication from 'adonis-provider-tester'
import SentryProvider from '../providers/SentryProvider'
import SentryTestKit from 'sentry-testkit'

const { testkit, sentryTransport } = SentryTestKit()
import sentryFakeConfig from './fixtures/sentry-fake-config'
const testConfigs = [
	{
		configName: 'sentry',
		appConfig: {
			...sentryFakeConfig,
			transport: sentryTransport,
			integrations: function () {
				return []
			},
		},
	},
]

const testMessage = 'testMessage'

test.group('Sentry provider test', (group) => {
	let adonisApp: AdonisApplication

	group.before(async () => {
		adonisApp = await AdonisApplication.initApplication([SentryProvider], testConfigs)
	})

	group.after(async () => {
		await adonisApp.stopServer()
	})

	test('Sentry provider capture message test', async () => {
		const sentry = adonisApp.iocContainer.use('Adonis/Addons/Sentry')
		sentry.captureMessage(testMessage)

		expect(testkit.reports()).is.not.empty
		const sentryCapturedMessages = testkit.reports().map(({ message }) => message)
		expect(sentryCapturedMessages).to.eql([testMessage])
	}).timeout(0)
})
