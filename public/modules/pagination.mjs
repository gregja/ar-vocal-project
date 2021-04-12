
export class Pagination {

    /**
     * Contructor of a navbar
     * @param integer total
     * @param integer offset
     * @param integer by_page
     * @param string current_page
     * @param array param_page
     * @param boolean mvc
     * @param idnavbar
     * @param filter (blank by default)
     */
    constructor(total, offset, by_page, current_page, param_page, mvc, idnavbar, filter="") {
        this.total = Number(total);
        this.offset = Number(offset);
        this.by_page = Number(by_page);
        this.current_page = String(current_page);
        this.param_page = (typeof param_page == "object") ? param_page : {};
        this.mvc = Boolean(mvc);
        this.idnavbar = (idnavbar != undefined) ? String(idnavbar) : null;
        this.clientSide = false;  // used with server by default
        this.lang = 'fr';  // french lang by default
        this.filter = String(filter).trim();
        // Only french and english languages supported on that version
        // TODO : externalize the translations outside of the class Pagination
        this.dataLang = {
            fr: {prev: "<< Page précédente", next: "Page suivante >>"},
            en: {prev: "<< Previous page", next: "Next page >>"}
        };
    }

    /**
     * short circuit the server for pagination in client side only (you need to complete with JS code in that case)
     */
    activateClientSide() {
        this.clientSide = true;
    }

    /**
     * Switch "fr" for another language
     * @param lang
     */
    setLanguage(lang) {
        lang = String(lang).toLowerCase();
        if (!this.dataLang.hasOwnProperty(lang)) {
            console.warn('Language ' + lang + ' not supported by the Pagination class');
            this.lang = 'fr'; // by default
        } else {
            this.lang = lang;
        }
    }

    /**
     * Constructor of a HTTP query
     * @param data
     * @param separator
     * @returns {string}
     */
    static httpBuildQuery(data, separator = "&") {
        var tmp_datas = [];
        for (let key of Object.keys(data)) {
            tmp_datas.push(key + '=' + encodeURI(data[key]));
        }
        return tmp_datas.join(separator);
    }

    /**
     * Converts a string to its html characters completely.
     * Source : https://ourcodeworld.com/articles/read/188/encode-and-decode-html-entities-using-pure-javascript
     * @param {String} str String with unescaped HTML characters
     **/
    static encodeHTML(str) {
        var buf = [];
        for (let i = str.length - 1; i >= 0; i--) {
            buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
        }
        return buf.join('');
    }

    /**
     * Generate the HTML code (including LI and A tags)
     * @param inactive
     * @param text
     * @param offset
     * @param current_page
     * @param params_page
     * @param specif
     * @returns {string}
     */
    printLink(inactive, text, offset, current_page, params_page, specif = null) {

        // on prépare l'URL avec tous les paramètres sauf "offset"
        if (specif != null) {
            offset = specif;
        } else {
            if (offset == undefined || offset == '' || offset == '0') {
                offset = '1';
            }
        }
        var url = '';
        params_page ['offset'] = offset;
        if (this.mvc) {
            url = this.constructor.httpBuildQuery(params_page, "/");
        } else {
            url = '?' + this.constructor.httpBuildQuery(params_page);
        }
        var output = '';
        current_page = this.constructor.encodeHTML(current_page);

        if (this.clientSide == true) {
            let tmpclass = "";
            if (inactive) {
                tmpclass = "active";
            }
            output = `<a class="page-link" data-offset="${offset}" class="page-item ${tmpclass}" data-href="${current_page}${url}" href="#">${text}</a>\n`;
        } else {
            if (inactive) {
                output = `<a data-offset="${offset}" href="#" class="active">${text}</a>\n`;
            } else {
                output = `<a data-offset="${offset}" class="inactive" href="${current_page}${url}">${text}</a>\n`;
            }
        }
        return output;
    }

    /**
     * Generate an array (of links) wich will be used for construction of the navbar
     * @param total
     * @param offset
     * @param by_page
     * @param current_page
     * @param param_page
     * @returns {Array}
     */
    indexedLinks(total, offset, by_page, current_page, param_page) {
        var separator = ' | ';
        var list_links = [];
        list_links.push(this.printLink(offset == 1, this.dataLang[this.lang].prev, offset - by_page, current_page, param_page, 'prev'));

        var compteur = 0;
        var top_suspension = false;
        // affichage de tous les groupes à l'exception du dernier
        var start, end;
        for (start = 1, end = by_page; end < total; start += by_page, end += by_page) {
            compteur += 1;
            list_links.push(this.printLink(offset == start, `${start}-${end}`, start, current_page, param_page));
        }
        end = (total > start) ? '-' + total : '';

        list_links.push(this.printLink(offset == start, `${start}${end}`, start, current_page, param_page));

        list_links.push(this.printLink(offset == start, this.dataLang[this.lang].next, offset + by_page, current_page, param_page, 'next'));

        return list_links;
    }

    /**
     * Final rendering of the navbar
     * @returns {string}
     */
    render() {
        var links = this.indexedLinks(this.total, this.offset, this.by_page, this.current_page, this.param_page);
        var idnavbar = '';
        if (this.idnavbar != null) {
            idnavbar = `data-idnavbar="${this.idnavbar}"`;
        }
        var html = `<nav class="pagination" aria-label="Page navigation" data-maxbypage="${this.by_page}" data-offset="${this.offset}" data-filter="${this.filter}">\n`;
        html += links.join(' | ');
        html += '</ul></nav>\n';
        return html;
    }
}

/**
 * Give life to the navbar and to the HTML table linked
 * @param navbar_area
 * @param table_area
 * @param nb_by_page
 */
export function navbarManager(navbar_area, table_area, nb_by_page=10) {

    let current_offset = 1;

    let navbar = navbar_area.querySelector('nav');
    if (navbar == undefined) {
        console.error(`container not found for navbar`);
        return;
    }

    let table = table_area.querySelector('tbody'); // direct pointer on the tbody part of the table
    if (table == undefined) {
        console.error(`container not found for table`);
        return;
    }

    /**
     * Highlight the link corresponding to the current offset
     */
    function animateBar() {
        let links = navbar.querySelectorAll('a');
        for(let i=0, imax=links.length; i<imax; i++) {
            let link = links[i];
            if (link.getAttribute('data-offset') == String(current_offset)) {
                link.classList.remove('inactive');
                link.classList.add('active');
            } else {
                link.classList.remove('active');
                link.classList.add('inactive');
            }
        }
    }

    /**
     * Show the table rows corresponding to the current offset, hide the others
     */
    function filterTableRows() {
        let rows = table.children;
        let max_offset = current_offset + nb_by_page;
        for (let i=0, imax=rows.length; i<imax; i++) {
            let row = rows[i];
            let current_index = i+1;
            if (current_index >= current_offset && current_index < max_offset) {
                row.style = "display: table-row";
                row.setAttribute('data-status', 'displayed');
            } else {
                row.style = "display: none";
                row.setAttribute('data-status', 'hidden');
            }
        }
    }

    // let's get life to all that ;)
    animateBar();
    filterTableRows();

    navbar.removeEventListener('click', (evt)=>{});
    navbar.addEventListener('click', (evt)=>{
        event.preventDefault();
        if (evt.target.nodeName != 'A') return;
        let idtarget = evt.target.dataset['offset'];
        let links = navbar.querySelectorAll('a');
        let imax = links.length;
        let offsets = [];
        // delete class "active" on items affected by it
        for (let i = 0; i < imax; i++) {
            let link = links[i];
            if (link.classList.contains("active")) {
                link.classList.toggle("active");
            }
            offsets.push(link.dataset['offset']);
        }
        // affect the class "active" on the item selected
        for (let i = 0; i < imax; i++) {
            let link = links[i];
            if (link.getAttribute('data-offset') == idtarget) {
                if (idtarget != 'next' && idtarget != 'prev') {
                    link.classList.toggle("active");
                    link.parentNode.setAttribute('data-offset', idtarget);
                } else {
                    let current = link.parentNode.getAttribute('data-offset');
                    let offsets = Array.from(links)
                        .map(a => a.getAttribute('data-offset'))
                        .filter(a => a != 'prev' && a != 'next');
                    let check = offsets.findIndex(item => item == current);

                    if (idtarget == 'next') {
                        if (check < offsets.length - 1) {
                            check++;
                        }
                    } else {
                        if (check > 0) {
                            check--;
                        }
                    }
                    links[check + 1].classList.toggle("active");
                    links[check + 1].parentNode.setAttribute('data-offset', offsets[check]);
                }
            }
        }
        current_offset = Number(navbar.dataset['offset']);
        filterTableRows();

    }, false)

}
