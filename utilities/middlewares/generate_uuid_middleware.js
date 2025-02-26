import uuid from 'node-uuid'
export const generate_uuid_middleware = () => async (req, res, next) => {
    res.locals.uuid = uuid.v4();
    next();
}