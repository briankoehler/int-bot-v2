import { Updater } from '../src/server/updater/updater'

it('updates successfully', async () => {
    await Updater.update()
})