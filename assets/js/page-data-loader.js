// Page Data Loader
(function(){
    function setMeta(name, content) {
        var el = document.querySelector('meta[name="' + name + '"]');
        if (el) el.setAttribute('content', content);
        else {
            el = document.createElement('meta');
            el.setAttribute('name', name);
            el.setAttribute('content', content);
            document.getElementsByTagName('head')[0].appendChild(el);
        }
    }

    function setProperty(prop, content) {
        var el = document.querySelector('meta[property="' + prop + '"]');
        if (el) el.setAttribute('content', content);
        else {
            el = document.createElement('meta');
            el.setAttribute('property', prop);
            el.setAttribute('content', content);
            document.getElementsByTagName('head')[0].appendChild(el);
        }
    }

    function clearUntilNextHeader(startEl) {
        var el = startEl.nextSibling;
        var removed = [];
        while(el) {
            if (el.nodeType === 1 && (/^H[34]$/i).test(el.tagName)) break;
            var next = el.nextSibling;
            removed.push(el);
            el.parentNode.removeChild(el);
            el = next;
        }
        return removed;
    }

    function createWidget(item) {
        var col = document.createElement('div');
        col.className = 'col-sm-3';

        var widget = document.createElement('div');
        widget.className = 'xe-widget xe-conversations box2 label-info';
        if (item.url) widget.setAttribute('onclick', "window.open('" + item.url.replace(/'/g, "\\'") + "', '_blank')");
        if (item.tooltip) {
            widget.setAttribute('data-toggle','tooltip');
            widget.setAttribute('data-placement','bottom');
            widget.setAttribute('title','');
            widget.setAttribute('data-original-title', item.tooltip);
        }

        var entry = document.createElement('div');
        entry.className = 'xe-comment-entry';

        var aimg = document.createElement('a');
        aimg.className = 'xe-user-img';
        var img = document.createElement('img');
        if (item.image) img.setAttribute('data-src', item.image);
        img.className = 'lozad img-circle';
        img.setAttribute('width','40');
        aimg.appendChild(img);

        var comment = document.createElement('div');
        comment.className = 'xe-comment';
        var atitle = document.createElement('a');
        atitle.className = 'xe-user-name overflowClip_1';
        atitle.setAttribute('href','#');
        var strong = document.createElement('strong');
        strong.innerHTML = item.title || '';
        atitle.appendChild(strong);
        var p = document.createElement('p');
        p.className = 'overflowClip_2';
        p.innerHTML = item.description || '';

        comment.appendChild(atitle);
        comment.appendChild(p);

        entry.appendChild(aimg);
        entry.appendChild(comment);
        widget.appendChild(entry);
        col.appendChild(widget);
        return col;
    }

    function renderSections(sections) {
        sections.forEach(function(section){
            // find header matching title
            var headers = Array.prototype.slice.call(document.querySelectorAll('h3,h4'));
            var header = headers.find(function(h){
                return h.textContent && h.textContent.trim().indexOf(section.title) === 0;
            });
            // if header not found, create one and insert into main-content before footer
            if (!header) {
                var main = document.querySelector('.main-content');
                if (!main) return;
                header = document.createElement('h4');
                header.className = 'text-gray';
                var icon = document.createElement('i');
                icon.className = 'linecons-tag';
                icon.setAttribute('id', section.title);
                icon.style.marginRight = '7px';
                header.appendChild(icon);
                header.appendChild(document.createTextNode('\n     ' + section.title));

                // try to insert before footer if present
                var footer = main.querySelector('footer.main-footer');
                if (footer) main.insertBefore(header, footer);
                else main.appendChild(header);
            }

            // remove existing content until next header
            clearUntilNextHeader(header);

            // create container rows
            var containerFragment = document.createDocumentFragment();
            var row = null;
            section.items.forEach(function(item, idx){
                if (idx % 4 === 0) {
                    row = document.createElement('div');
                    row.className = 'row';
                    containerFragment.appendChild(row);
                }
                var col = createWidget(item);
                row.appendChild(col);
            });

            // insert after header
            header.parentNode.insertBefore(containerFragment, header.nextSibling);
        });

        // trigger lozad observer if available
        try{
            if (window.lozad) {
                const observer = lozad();
                observer.observe();
            }
        }catch(e){/*ignore*/}
    }

    function createMenuItem(item) {
        var li = document.createElement('li');
        if (item.sub && Array.isArray(item.sub) && item.sub.length) {
            li.className = 'has-sub';
            var a = document.createElement('a');
            a.className = 'smooth';
            a.setAttribute('href', item.href || '#');
            if (item.icon) {
                var i = document.createElement('i');
                i.className = item.icon;
                a.appendChild(i);
            }
            var span = document.createElement('span');
            span.className = 'title';
            span.textContent = item.title || '';
            a.appendChild(span);
            li.appendChild(a);

            var ul = document.createElement('ul');
            item.sub.forEach(function(sub){
                var sli = document.createElement('li');
                var sa = document.createElement('a');
                sa.className = 'smooth';
                sa.setAttribute('href', sub.href || '#');
                var st = document.createElement('span');
                st.className = 'title';
                st.textContent = sub.title || '';
                sa.appendChild(st);
                sli.appendChild(sa);
                ul.appendChild(sli);
            });
            li.appendChild(ul);
        } else {
            var a = document.createElement('a');
            a.setAttribute('href', item.href || '#');
            if (item.icon) {
                var i2 = document.createElement('i');
                i2.className = item.icon;
                a.appendChild(i2);
            }
            var span2 = document.createElement('span');
            span2.className = 'title';
            span2.textContent = item.title || '';
            a.appendChild(span2);
            li.appendChild(a);
        }
        return li;
    }

    function renderMenu(menu) {
        if (!menu || !Array.isArray(menu)) return;
        var ul = document.getElementById('main-menu');
        if (!ul) {
            ul = document.querySelector('.main-menu');
            if (!ul) return;
        }
        // clear existing
        ul.innerHTML = '';
        menu.forEach(function(item){
            var li = createMenuItem(item);
            // auto-expand if this item (or one of its subs) matches current page
            try {
                var curPath = window.location.pathname;
                var shouldExpand = false;
                if (item.href) {
                    var itemUrl = new URL(item.href, window.location.href);
                    if (itemUrl.pathname === curPath) shouldExpand = true;
                }
                if (!shouldExpand && item.sub && Array.isArray(item.sub)) {
                    item.sub.forEach(function(sub){
                        try {
                            var subUrl = new URL(sub.href, window.location.href);
                            if (subUrl.pathname === curPath) shouldExpand = true;
                        } catch(e){}
                    });
                }
                if (shouldExpand) {
                    li.classList.add('expanded');
                    var childUl = li.querySelector('ul');
                    if (childUl) childUl.style.display = 'block';
                }
            } catch(e) {/* ignore URL errors */}
            ul.appendChild(li);
        });
    }

    function applyData(data) {
        if (!data) return;
        if (data.title) document.title = data.title;
        Object.keys(data).forEach(function(key){
            var val = data[key];
            if (key === 'title') return;
            if (key.indexOf('meta.') === 0) {
                var name = key.split('.').slice(1).join('.');
                setMeta(name, val);
                return;
            }
            if (key.indexOf('og.') === 0) {
                setProperty('og:' + key.split('.').slice(1).join('.'), val);
                return;
            }
            if (key === 'sections' && Array.isArray(val)) {
                renderSections(val);
                return;
            }
            if (key === 'menu' && Array.isArray(val)) {
                renderMenu(val);
                return;
            }
            // prefer id
            var el = document.getElementById(key);
            if (el) {
                el.innerHTML = val;
                return;
            }
            // fallback to data-key attribute
            el = document.querySelector('[data-key="' + key + '"]');
            if (el) {
                el.innerHTML = val;
                return;
            }
        });
    }

    function loadPageData(path){
        if (!path) return;
        fetch(path, {cache: 'no-cache'})
            .then(function(resp){ if(!resp.ok) throw new Error('Network error'); return resp.json() })
            .then(function(json){ applyData(json); })
            .catch(function(err){ console.warn('page-data-loader:', err); });
    }

    // Auto-run: body attribute `data-page` should contain relative path to JSON
    document.addEventListener('DOMContentLoaded', function(){
        var body = document.body;
        var page = body && body.getAttribute('data-page');
        if (page) loadPageData(page);
    });

    // Delegated handler for dynamically inserted `a.smooth` links so they behave
    // like the ones on the index page (toggle mobile menu, destroy ps, smooth scroll).
    (function(){
        if (window.jQuery) {
            $(document).on('click', 'a.smooth', function(ev){
                ev.preventDefault();
                try{ if (window.public_vars && public_vars.$mainMenu) public_vars.$mainMenu.add(public_vars.$sidebarProfile).toggleClass('mobile-is-visible'); }catch(e){}
                try{ if (typeof ps_destroy === 'function') ps_destroy(); }catch(e){}
                var href = $(this).attr('href');
                try{
                    var $target = $(href);
                    if ($target.length) {
                        $('html, body').animate({ scrollTop: $target.offset().top - 30 }, { duration: 500, easing: 'swing' });
                    } else if (href && href.indexOf('#') === 0) {
                        // fallback: jump to element by id
                        var id = href.slice(1);
                        var el = document.getElementById(id);
                        if (el) $('html, body').animate({ scrollTop: $(el).offset().top - 30 }, { duration: 500, easing: 'swing' });
                    }
                }catch(e){
                    try{ var target = document.querySelector(href); if(target) target.scrollIntoView({behavior:'smooth', block:'start'}); }catch(e){}
                }
                return false;
            });
        } else {
            document.addEventListener('click', function(ev){
                var el = ev.target;
                while(el && el !== document) {
                    if (el.matches && el.matches('a.smooth')) break;
                    el = el.parentNode;
                }
                if (!el || el === document) return;
                ev.preventDefault();
                try{ if (window.public_vars && public_vars.$mainMenu) public_vars.$mainMenu.add(public_vars.$sidebarProfile).toggleClass('mobile-is-visible'); }catch(e){}
                try{ if (typeof ps_destroy === 'function') ps_destroy(); }catch(e){}
                var href = el.getAttribute('href');
                if (href && href.indexOf('#') === 0) {
                    var id = href.slice(1);
                    var target = document.getElementById(id);
                    if (target) {
                        var top = target.getBoundingClientRect().top + window.pageYOffset - 30;
                        window.scrollTo({ top: top, behavior: 'smooth' });
                    }
                } else {
                    try{ var target = document.querySelector(href); if(target) target.scrollIntoView({behavior:'smooth', block:'start'}); }catch(e){}
                }
            }, false);
        }
    })();
})();
