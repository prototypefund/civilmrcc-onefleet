export default {
    data:[
        {   
            template: 'landmark',
            field: 'testtag',
            key:'firsttest',
            value:'Some test value'
        },
        {   
            template: 'landmark',
            field: 'testtag',
            key:'anothertest',
            value:'Another test value'
        }
    ],
    getTagsForField:function(template,field){
        console.log(template,field);
        let results = [];
        for(let i in this.data){
            if(this.data[i].template == template&&this.data[i].field == field)
                results.push({key:this.data[i].key, value:this.data[i].value});
        }
        console.log('got results!');
        console.log('got results!');
        return results;
    }
}
        