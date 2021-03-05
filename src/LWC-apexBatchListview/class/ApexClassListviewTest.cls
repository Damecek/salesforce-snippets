@IsTest
private class ApexClassListviewTest {
    @IsTest
    static void testBehavior() {
        System.assertEquals(
                0,
                ApexClassListview.getAsyncApexJobs('TODAY', 'asd', 1).size()
        );
        System.assertEquals(
                0,
                ApexClassListview.getApexClassNames().size()
        );
        ApexClassListview.cover();
    }
}