export function actionCreate(type, content) {
    return {
        type: type,
        content: content
    }
}

export default function reducer(state, action) {
    let newState = Object.assign({}, state);
    switch (action.type){
        case 'SET_POINT_DETAIL':
            // newState.culture =
            return Object.assign(
                {},
                state,
                {culture: Object.assign({}, state.culture, action.content)}
            );
        default:
            return newState;
    }
}