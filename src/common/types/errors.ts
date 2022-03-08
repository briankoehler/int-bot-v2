interface Success<T> {
    ok: true
    value: T
}

interface MyError<T> {
    ok: false
    value: T | Error
}

export type Result<T, E = Error> = Success<T> | MyError<E>

export const handleResult = <T, E>(result: Result<T, E>) => {
    if (result.ok) return result.value
    throw result.value
}
