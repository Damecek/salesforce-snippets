import {LightningElement, wire, track} from 'lwc';
import {refreshApex} from "@salesforce/apex";

import getAsyncApexJobs from '@salesforce/apex/ApexClassListview.getAsyncApexJobs';
import getClassNames from '@salesforce/apex/ApexClassListview.getApexClassNames';

const DEFAULT_DATA_SIZE = 10;

export default class apexClassListview extends LightningElement {
    loading = false;

    @track className = {
        value: null,
        options: [],
    }

    classNameOptionsWired;
    @wire(getClassNames)
    wiredGetClassNames(result) {
        this.loading = true;
        this.classNameOptionsWired = result;
        if (result.data) {
            this.className.options = result.data;
            if (!this.className.value && result.data.length > 0) {
                this.className.value = result.data[0]['value'];
            }
        }
        if (result.error) {
            console.log(result.error);
        }
        this.loading = false;
    }
    dateRangeValue = 'TODAY';

    get dateRangeOptions() {
        return [
            { label: 'Today', value: 'TODAY' },
            { label: 'Last Week', value: 'LAST_N_DAYS:7' },
            { label: 'Last Month', value: 'LAST_N_DAYS:30' },
            { label: 'All Time', value: 'all' },
        ];
    }

    data;
    columns = [
        {
            label: 'Class Name',
            fieldName: 'ApexClass.Name',
            initialWidth: 300,
            hideDefaultActions: true
        },
        {
            label: 'Type',
            fieldName: 'JobType',
            initialWidth: 110,
            hideDefaultActions: true
        },
        {
            label: 'Status',
            fieldName: 'Status',
            initialWidth: 110,
            hideDefaultActions: true
        },
        {
            label: 'Created Date',
            fieldName: 'CreatedDate',
            type: 'date',
            initialWidth: 160,
            hideDefaultActions: true,
            typeAttributes: {
                year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
            }
        },
        {
            label: 'Completed Date',
            fieldName: 'CompletedDate',
            type: 'date',
            initialWidth: 160,
            hideDefaultActions: true,
            typeAttributes: {
                year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
            }
        },
        {
            label: 'Total',
            fieldName: 'TotalJobItems',
            type: 'number',
            cellAttributes: {alignment: 'left'},
            hideDefaultActions: true
        },
        {
            label: 'Processed',
            fieldName: 'JobItemsProcessed',
            type: 'number',
            cellAttributes: {alignment: 'left'},
            hideDefaultActions: true
        },
        {
            label: 'Errors',
            fieldName: 'NumberOfErrors',
            type: 'number',
            cellAttributes: {alignment: 'left'},
            hideDefaultActions: true
        },
        {
            label: 'Submitted By',
            fieldName: 'CreatedBy.Name',
            initialWidth: 150,
            hideDefaultActions: true
        },
    ]
    dataSize = DEFAULT_DATA_SIZE;
    tableElement;
    wiredData;
    @wire(getAsyncApexJobs, {range: '$dateRangeValue', className: '$className.value', limitSize : '$dataSize'})
    wiredGetBatches(result) {
        this.loading = true;
        this.wiredData = result;
        if (result.data) {
            this.data = this.flattenArray(result.data);
        }
        if (result.error) {
            console.log(result.error);
        }
        this.loading = false;
    }

    flattenArray(data) {
        let currentData = [];
        data.forEach((row) => {
            let currentRow = {
                Id: row.Id,
                'ApexClass.Name': row.ApexClass.Name,
                JobType: row.JobType,
                Status: row.Status,
                CreatedDate: row.CreatedDate,
                CompletedDate: row.CompletedDate,
                TotalJobItems: row.TotalJobItems,
                JobItemsProcessed: row.JobItemsProcessed,
                NumberOfErrors: row.NumberOfErrors,
                'CreatedBy.Name': row.CreatedBy.Name,
            };
            currentData.push(currentRow);
        });
        return currentData;
    }

    isSelectedRealtime = false;
    interval;

    handleClickRealtime() {
        this.isSelectedRealtime = !this.isSelectedRealtime;
        if (this.isSelectedRealtime) {
            window.addEventListener("beforeunload", this.beforeUnloadHandler);
            this.interval = setInterval(() => {
                refreshApex(this.wiredData);
            }, 1000)
        } else {
            clearInterval(this.interval);
        }
    }

    handleClickRefresh() {
        refreshApex(this.wiredData);
    }

    beforeUnloadHandler() {
        clearInterval(this.interval);
    }

    disconnectedCallback() {
        window.removeEventListener("beforeunload", this.beforeUnloadHandler);
    }

    handleChangeClass(event) {
        this.className.value = event.detail.value;
        this.resetQuery();
    }

    handleChangeRange(event) {
        this.dateRangeValue = event.detail.value;
        this.resetQuery();
    }

    resetQuery() {
        this.dataSize = DEFAULT_DATA_SIZE;
        if (this.tableElement) {
            this.tableElement.enableInfiniteLoading = true;
        }
        refreshApex(this.wiredData);
    }

    loadMoreData(event) {
        this.dataSize += DEFAULT_DATA_SIZE;
        if(event.target){
            event.target.isLoading = true;
        }
        this.tableElement = event.target;

        getAsyncApexJobs({range: this.dateRangeValue, className: this.className.value, limitSize : this.dataSize})
            .then((data) => {
                this.data = this.flattenArray(data);
                if (data.length < this.dataSize) {
                    this.tableElement.enableInfiniteLoading = false;
                }
                this.tableElement.isLoading = false;
            }
        );
    }
}
