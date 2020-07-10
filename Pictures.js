var Abs;
(function (Abs) {
    var Pictures = /** @class */ (function () {
        function Pictures(o) {
            this.options = o;
        }
        Pictures.prototype.init = function () {
            var me = this;
            var $pics = $("#pictures");
            var $list = $(".list", $pics);
            this.picLinks = $("div.links", $pics);
            this.picLinksTemplate = kendo.template($("#picture-links-template").html());
            this.lv = $list.kendoListView({
                template: kendo.template($("#picture-template").html()),
                dataBound: function (e) {
                    var notFound = $("h3.nopics", $list);
                    if (e.sender.dataSource.data().length === 0) {
                        if (!notFound.length) {
                            $list.append("<h3 class='nopics' style='margin: 0 1em'>No Pictures Available!</h3>");
                        }
                    }
                    else if (notFound.length) {
                        $list.remove("h3.nopics");
                    }
                },
                dataSource: {
                    data: [],
                    filter: { field: "IsDeleted", operator: "eq", value: false }
                }
            }).getKendoListView();
            me.uploader = $("#files", $pics).kendoUpload({
                async: {
                    saveUrl: this.options.saveUrl,
                    autoUpload: true
                },
                localization: {
                    select: "Select Pictures..."
                },
                upload: function (e) {
                    $.each(e.files, function (i, v) {
                        var ex = v.extension.toLowerCase();
                        if (ex !== ".jpg" && ex !== ".jpeg" && ex !== ".png" && ex !== ".gif") {
                            kendo.alert("Only .jpg, .jpeg, .png & .gif files can be uploaded");
                            e.preventDefault();
                            return false;
                        }
                        return true;
                    });
                },
                success: function (e) {
                    if (e.operation === "upload") {
                        $.each(e.response, function (i, v) {
                            v.url = me.options.url;
                            me.lv.dataSource.add(v);
                        });
                    }
                },
                error: function (e) {
                    kendo.alert(e.XMLHttpRequest.responseText);
                }
            }).getKendoUpload();
            this.pw = $("#picture-window").kendoAlliedWindow({
                width: 2048,
                height: 1536,
                title: "Picture"
            }).getKendoAlliedWindow();
            $pics.on("click", "a.pic", function (e) {
                var a = $(e.currentTarget);
                me.currentPic = me.setPicture(a.data("id"));
                me.pw.show();
                return false;
            }).on("click", "a.setcaption", function (e) {
                var data = me.lv.dataSource.getByUid($(e.currentTarget).closest("div.picture").data("uid"));
                var c = prompt("Enter a caption", data.get("Caption"));
                if (c != null) {
                    data.set("Caption", c);
                    data.set("IsDirty", true);
                    $(e.currentTarget).html(c);
                }
                return false;
            }).on("click", "a.delete", function (e) {
                kendo.confirm("Delete this Picture?")
                    .done(function () {
                    var data = me.lv.dataSource.getByUid($(e.currentTarget).closest("div.picture").data("uid"));
                    data.set("IsDeleted", true);
                    me.lv.dataSource.fetch();
                });
                return false;
            }).on("change", "input.setprivate", function (e) {
                var data = me.lv.dataSource.getByUid($(e.currentTarget).closest("div.picture").data("uid"));
                data.set("Private", $(e.currentTarget).is(":checked"));
                data.set("IsDirty", true);
                return false;
            });
            me.toolbar = $(".toolbar", me.pw.element).kendoToolBar({
                items: [
                    {
                        type: "button",
                        text: "Prev",
                        id: "prev-picture-btn",
                        enable: false,
                        spriteCssClass: "k-icon custom-icon left-icon",
                        click: function () {
                            if (me.currentPic) {
                                var ds = me.lv.dataSource;
                                var idx = ds.indexOf(me.currentPic);
                                if (idx > 0) {
                                    me.currentPic = me.setPicture(ds.at(idx - 1).uid);
                                }
                            }
                        }
                    },
                    {
                        type: "button",
                        text: "Next",
                        id: "next-picture-btn",
                        enable: false,
                        spriteCssClass: "k-icon custom-icon right-icon",
                        click: function () {
                            if (me.currentPic) {
                                var ds = me.lv.dataSource;
                                var idx = ds.indexOf(me.currentPic);
                                if (idx < (ds.data().length - 1)) {
                                    me.currentPic = me.setPicture(ds.at(idx + 1).uid);
                                }
                            }
                        }
                    },
                    {
                        template: "<label>Right click on image for more options</label>"
                    },
                ]
            }).getKendoToolBar();
        };
        Pictures.prototype.setData = function (pics) {
            var _this = this;
            if (pics) {
                var url_1 = this.options.url;
                $.each(pics, function (i, v) {
                    v.url = url_1;
                    if (_this.options.publicGenericUrl && v.GenericID) {
                        v.publicUrl = _this.options.publicGenericUrl + "/" + v.GenericID;
                    }
                    else if (_this.options.publicUrl && v.PictureID) {
                        v.publicUrl = _this.options.publicUrl + "/" + v.PictureID;
                    }
                    else {
                        v.publicUrl = "";
                    }
                });
            }
            else {
                pics = [];
            }
            this.lv.dataSource.data(pics);
            this.picLinks.html(this.picLinksTemplate(pics));
        };
        Pictures.prototype.refresh = function (pics) {
            this.setData(pics);
            $("ul.k-upload-files li").remove();
        };
        Pictures.prototype.setPicture = function (uid) {
            var pic, idx = 0;
            var pics = this.lv.dataSource.data();
            for (var i = 0; i < pics.length; i++) {
                if (pics[i].uid === uid) {
                    pic = pics[i];
                    idx = i;
                }
            }
            if (pic) {
                var url = void 0;
                if (this.options.publicGenericUrl && pic.GenericID) {
                    url = this.options.publicGenericUrl + "/" + pic.GenericID;
                    this.publicUrl = url;
                }
                else if (this.options.publicUrl && pic.PictureID) {
                    url = this.options.publicUrl + "/" + pic.PictureID;
                    this.publicUrl = url;
                }
                else {
                    this.publicUrl = "";
                    url = this.options.url + "/picture?picid=" + pic.PictureID + "&objid=" + pic.ObjectID + "&genid=" + pic.GenericID;
                }
                this.pw.element.find("img").attr("src", url);
                this.pw.title(pic.Caption);
            }
            var prev = $("#prev-picture-btn");
            var next = $("#next-picture-btn");
            if (idx > 0 && pics.length > 1) {
                this.toolbar.enable(prev, true);
            }
            else {
                this.toolbar.enable(prev, false);
            }
            if (idx < (pics.length - 1) && pics.length > 1) {
                this.toolbar.enable(next, true);
            }
            else {
                this.toolbar.enable(next, false);
            }
            if (this.publicUrl) {
                this.toolbar.show($("#copy-picture-url-btn"));
            }
            return pic;
        };
        return Pictures;
    }());
    Abs.Pictures = Pictures;
})(Abs || (Abs = {}));
//# sourceMappingURL=Pictures.js.map