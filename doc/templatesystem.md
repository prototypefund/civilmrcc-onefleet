# Templatesystem

## Basics

All objects shown in the map are defined as "items" and stored in the item database. Each item has a template (like "vehicle", "case" or "landmark") which is defined in the src/components/items/templates.js


## Adding a template

You can simply add a new object in the template.js file with the following parameters:

```
landmark: {
  plural: 'Landmarks', //plural of the object name 
  pouch_identifier: 'LANDMARK', //unique identifier for pouchdb
  add_initial_position: true, //define if user has to position when adding the item
        type: 'line', //point or line (line = n points),
  fields: [ /* fields will be defined here*/ ]
}
``` 


## Define fields

Fields are defined like this:
```
landmark: {
  plural: 'Landmarks', //plural of the object name 
  (...)
  fields: [
		  {
            name: 'name',
            title: 'title',
            type: 'text',
          },
          {
            name: 'icon',
            title: 'icon',
            type: 'icon',
          },
          {
            name: 'testtag',
            title: 'testtag',
            type: 'tag',
          },
          {
            name: 'selectme',
            title: 'Select me',
            type: 'select',
            options: {
              option_one: 'First Option',
              option_two: 'Second Option',
            },
          },
          {
            name: 'some_number',
            title: 'Some number',
            type: 'number',
            value: -1,
            step: 1,
          }
  ]
}
```

## Field Types

- text
Basic text input

- number
Numeric value

- select
option select

- tag 
Tag select (see below)

## Tags

To predifine tags for a field it has to be added to the src/components/items/tags.js

Let's say you want to add a tag option to the field "testtag" in the template "landmarks" (as in the example above). You only have to add this object to the file:

```
		{   
            template: 'landmark',
            field: 'testtag',
            key:'firsttest', //unique identifier
            value:'Some test value' //... value
        },
```



