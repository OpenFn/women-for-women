//Using Mailgun adaptor
send(
  fields(
    field('from', 'notifier@womenforwomen.openfn.org'), 
    field('to', dataValue('fields.Work Email')), 
    field('subject', `Welcome to Women for Women!`), 
    field('html', state =>{ //TODO: Update with email template
      var msg = `html body`; 
      return msg; 
    })
))
