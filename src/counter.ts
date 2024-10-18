import { DB } from "./db";

export class Counter {

	counters: Map<string,number> = new Map<string,number>();
	db: DB;

	constructor(db: DB){
		this.db = db;
		this.loadCounters();
	}

	private saveCounters(){
		const counterArray: {name: string,count: number}[] = [];
		this.counters.forEach((value,key) => {
			counterArray.push({name: key,count:value});
		});
		this.db.setConfig("Counters",JSON.stringify(counterArray));
	}

	private loadCounters(){
		const counterArray: {name: string,count: number}[]  = JSON.parse(this.db.getOrSetConfig("Counters",JSON.stringify([])));
		counterArray.forEach((value) => {
			this.counters.set(value.name,value.count);
		})
	}
	
	public getCounter(name: string): number{
		if (!this.counters.has(name)) return 0;
		return this.counters.get(name);
	}

	public addToCounter(name: string,number: number){
		this.counters.set(name,this.getCounter(name) + number);
		this.saveCounters();
	}

	public setCounter(name: string,number: number){
		this.counters.set(name, number);
		this.saveCounters();
	}

}
