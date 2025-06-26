import { useEffect, useState } from "react";

export default function Nav(){
    const [state, setState] = useState(false);
    /* 처음 실행되거나 페 이지 변경 또는 동적 동작 시 실행*/
    useEffect(() => {
        console.log(state)
    }, [state])
    /* 현재 페이지의 주소 가져오기*/
    
    

    return (
        <button onClick={() => setState(!state)}>
            {window.location.pathname}
        </button>
    )
}