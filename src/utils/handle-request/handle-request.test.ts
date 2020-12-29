import { handleRequest } from './handle-request'

describe('handleRequest', () => {

    it.each([

        ['aborts image requests', 'image', true, false],
        ['aborts stylesheet requests', 'stylesheet', true, false],
        ['aborts font requests', 'font', true, false],
        ['aborts image requests', 'image', true, false],

        ['continues foo requests', 'foo', false, true],
        ['continues undefined requests', undefined, false, true],
        ['continues null requests', null, false, true]

    ])('%s', (_message, resourceType, shouldAbortRequest, shouldContinueRequest) => {

        const mockReq = {
            resourceType: () => resourceType,
            abort: jest.fn(),
            continue: jest.fn()
        }

        handleRequest(mockReq)

        if (shouldAbortRequest)
            expect(mockReq.abort).toHaveBeenCalledTimes(1)
        else
            expect(mockReq.abort).toHaveBeenCalledTimes(0)

        if (shouldContinueRequest)
            expect(mockReq.continue).toHaveBeenCalledTimes(1)
        else
            expect(mockReq.continue).toHaveBeenCalledTimes(0)

    })

})
