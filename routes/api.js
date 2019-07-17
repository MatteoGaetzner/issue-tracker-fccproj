/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
const CONNECTION_STRING = process.env.DB; //



  module.exports = function (app) {
  
  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      var searchQuery = req.query;
      console.log(req.originalUrl)
      if (searchQuery._id) { searchQuery._id = new ObjectId(searchQuery._id)}
      if (searchQuery.open) { searchQuery.open = String(searchQuery.open) == "true" }
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        var collection = db.collection(project);
        collection.find(searchQuery).toArray(function(err,docs){res.json(docs)});
      });
    })
    
    .post(function (req, res){
      console.log('Post request made')
      var project = req.params.project;
      var newIssue = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by: req.body.created_by,
        assigned_to:  req.body.assigned_to || '',
        open: true,
        status_text:  req.body.status_text || '',
      }
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.collection(project).insertOne(newIssue, (err, doc) => {
          err ? console.error(err) : console.log('Posted doc successfully')
          res.json(newIssue)
        })
      })
    })
    
    .put(function (req, res){
      var project = req.params.project;
      var _id = req.body._id
      MongoClient.connect(CONNECTION_STRING, async (err, db) => {
        if(err){console.log(err)}
        var doc = await db.collection(project).findOne({_id: ObjectId(_id)})
        
        try{
        
        var newDoc = await db.collection(project).findOneAndUpdate(
        {_id: ObjectId(_id)}, 
        { $set: {
          issue_title: req.body.issue_title || doc.issue_title,
          issue_text: req.body.issue_text || doc.issue_text,
          created_by: req.body.created_by || doc.created_by,
          assigned_to:  req.body.assigned_to || doc.assigned_to,
          open: (req.body.open == 'open') || (doc.open == 'open'),
          status_text:  req.body.status_text || doc.satus_text,
          },
          $currentDate: {
          updated_on: true
          }
        },
        {
          returnNewDocument: true
        })
        
        JSON.stringify(newDoc.value) == JSON.stringify(doc) ? 
            res.send('No Fields Updated') :
            res.send('Successfully Updated Issue')
          
        } catch(e) {
          console.log(e)
        }
        
      })
      
    })
    
    .delete(function (req, res){
      var _id = req.body._id;
      var project = req.params.project;
      MongoClient.connect(CONNECTION_STRING, async (err,db) => {
        
        try{
        await db.collection(project).remove(({_id: ObjectId(_id)}))
          console.log('Successfully deleted doc')
         
          res.send('Successfully Deleted Issue')
          
      } catch(err){
        console.log(err)
      }
      })
    });
    
};
