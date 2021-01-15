import React, {useState} from 'react'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { parseCookies } from 'nookies'
import {useRouter} from 'next/router'
import Alert from 'react-bootstrap/Alert'


export default function Question({ question }){

    let [answer, setAnswer ] = useState(null)
    let [evaluated, setEvaluated] = useState(null)

    let router = useRouter()
    let cookies = parseCookies()
    let user_id = cookies.user_id
    

    let submitResponse = async () => {
        let request = await fetch('/api/evaluateResponse', {
            headers:{ 'Content-Type': 'application/json'},
            body: JSON.stringify({ question_id: question.id, user_id: user_id, answer: answer}),
            method: "POST",
        })
        let response = await request.json()
        setEvaluated(response.data)
        setTimeout(function(){
            setEvaluated(null)
            router.push('/')}, 2500)
    }

    return(
        <>
        {evaluated ? <Alert variant="info">You answer was {evaluated.isCorrect ? 
            "correct": `wrong. Correct answer is ${evaluated.correct}`}</Alert> : <></>}
        {question ? <Card.Body>
            <h4>{question.question_text}</h4>
            <hr/>
            {(question.options.concat(question.correct_answer)).map((answer, idx)=>{
                return ( <h4 key={idx}>
                            <Form.Check type="radio" 
                                onChange={e => {setAnswer(e.target.value)}}  value={answer} name="options" label={answer} />
                         </h4> )
            })}
            <div className="container">
                {   answer ?
                    <Button className="col-sm-12 col-lg-12 col-md-12" variant="warning" onClick={submitResponse}>Answer</Button> :
                    <Button className="col-sm-12 col-lg-12 col-md-12" variant="warning" disabled>Answer</Button>
                }
            </div>
        </Card.Body> : <h4>You have answered all available questions.</h4>
        }
        </>
    )
}