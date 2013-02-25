define(function() {
	var Paginator = {
			curPage : 1,
			totalRec: 0,
			limit: 20,
			initialize: function () {
				this.curPage = 1;
				this.totalRec = 0;
				this.limit = 20; // default records per page
				return;
			},
			showMore: function () {
				var endAt = this.curPage * this.limit;
				if (endAt >= this.totalRec) {
					return false; // no more pages
				} else {
					return true; // show more pages
				}
			}
		};
	
	return Paginator;
});