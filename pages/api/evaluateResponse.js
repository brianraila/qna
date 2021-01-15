// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import faunadb, {query as q} from 'faunadb';
const client = new faunadb.Client({secret: process.env.FAUNA_SECRET })

export default async (req, res) => {
    if(req.method == 'POST'){
        let {question_id, user_id, answer } = req.body
        if (!(question_id && answer && user_id)){
            res.json({ error: "Fields question_id & answer & user_id should be provided." })
        }
        else {
            let results = await client.query(
                q.Get( q.Ref(q.Collection('questions'), question_id)))
            let question = results.data
            let isCorrect = false
            if ( question.correct_answer === answer ){ isCorrect = true }
            try{
                let query = await client.query(
                    q.Create(q.Collection('answers'), 
                        { data : { question_id, user_id, isCorrect: isCorrect, response: answer }})
                )
                query.data.correct = answer
                res.json({ ref: query.ref.id, data: query.data })  
            }catch(error){
                if(error.message === 'instance not unique'){
                    res.json({error: 'Question is already answered'})
                }
            }                    
    }
  }
}