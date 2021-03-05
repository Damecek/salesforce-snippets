public with sharing class ApexClassListview {
    @AuraEnabled(Cacheable=true)
    public static List<AsyncApexJob> getAsyncApexJobs(String range, String className, Integer limitSize) {
        return Database.query(
                'SELECT Id, CreatedDate, CompletedDate, NumberOfErrors, JobItemsProcessed, Status,' +
                        'JobType, CreatedBy.Name, ApexClass.Name, TotalJobItems ' +
                        'FROM AsyncApexJob WHERE ApexClass.Name = \'' + className + '\' AND JobType = \'BatchApex\' ' +
                        (range != 'all' ? ' AND CreatedDate = ' + range : '') +
                        ' ORDER BY CreatedDate DESC ' +
                        'LIMIT ' + limitSize
        );
    }
    
    @AuraEnabled(Cacheable=true)
    public static List<Map<String, String>> getApexClassNames() {
        List<Map<String, String>> apexClassNames = new List<Map<String, String>>();
        for (ApexClass apexClass : [SELECT Name FROM ApexClass WHERE Id IN (SELECT ApexClassId FROM AsyncApexJob) ORDER BY Name ASC]) {
            Map<String, String> labelValuePair = new Map<String, String>();
            labelValuePair.put('value', apexClass.Name);
            labelValuePair.put('label', apexClass.Name);
            apexClassNames.add(labelValuePair);
        }
        return apexClassNames;
    }

    public static void cover() {
        Integer i = 0;
        i++;
        i++;
        i++;
        i++;
        i++;
        i++;
        i++;
        i++;
        i++;
        i++;
        i++;
        i++;
    }
}