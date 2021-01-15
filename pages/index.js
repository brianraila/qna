import Head from 'next/head'
import React, { useState, useEffect } from 'react'

import { parseCookies, setCookie, destroyCookie } from 'nookies'

import faunadb, {query as q} from 'faunadb';
const db = new faunadb.Client({secret: process.env.FAUNA_SECRET })
import rw from 'random-words' 

//Bootstrap Components
import Card from 'react-bootstrap/Card'

//Import Custom Components
import Question from '../components/Question'

export default function Home( { question, auth } ) {

  let [questionId, setQuestionId] = useState(null)
  let [userId, setUserId] = useState(null)
  let cookies = parseCookies()


  return (
    <div className="container">
      <h5 style={{paddingTop:"3em"}}>🤔 Questions need answers</h5>
      <hr/>
      <Card>
        <Card.Header>
          <h5 style={{float:'right'}}>Hello {cookies.user_id}</h5>
        </Card.Header>

            <Question question={ question } />

        <p></p>
      </Card>
      <Card.Footer>
      </Card.Footer>
    </div>
  )
}

export async function getServerSideProps(context) {
  //Check for cookies and setCookie if none
  let cookies = parseCookies(context)
  if(!cookies.user_id){
    setCookie(context, 'user_id', `${rw()}${Math.floor((Math.random() * 999) + 900)}`, {
      maxAge: 7 * 24 * 60 * 60, path: '/', })
  }

  // Fetch questions
  let query = await db.query(
    q.Difference(
      //All questions
      q.Select('data', q.Map(
        q.Paginate(q.Documents(q.Collection('questions'))), q.Lambda('ref', q.Var('ref')))),
      // Attempted Questions
      q.Select('data', q.Map(
        q.Paginate( q.Match(q.Index('questions_attempted_by_user'), cookies.user_id)),
        q.Lambda('question_id', q.Ref(q.Collection('questions'), q.Var('question_id')))
      ))
    )
  )

  let question = null
  if(query.length > 0){
    let result = await db.query(q.Get(query[0]))
    question = result.data
    question.id = result.ref.id
  }

  return {
    props: {
      question,
    }, // will be passed to the page component as props
  }
}

