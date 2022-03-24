export class PrismaClientKnownRequestError {
    constructor(public message: string, public code: string, public clientVersion: string) {}
}

export class PrismaClientUnknownRequestError {
    constructor(public message: string, public clientVersion: string) {}
}

export class PrismaClientRustPanicError {
    constructor(public message: string, public clientVersion: string) {}
}

export class PrismaClientInitializationError {
    constructor(public message: string, public code: string, public clientVersion: string) {}
}

export class PrismaClientValidationError {
    constructor(public message: string) {}
}
