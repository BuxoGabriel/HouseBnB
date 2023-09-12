export default interface dbI {
    init(): Promise<void>,
    teardown(): Promise<void>
}